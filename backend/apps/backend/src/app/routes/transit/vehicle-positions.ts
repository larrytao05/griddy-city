import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import axios from 'axios';
import * as protobuf from 'protobufjs';
import * as path from 'path';

// Schema for vehicle position
const vehiclePositionSchema = z.object({
  vehicle_id: z.string(),
  trip_id: z.string(),
  route_id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  bearing: z.number().optional(),
  speed: z.number().optional(),
  current_stop_id: z.string().optional(),
  current_stop_status: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']).optional(),
  congestion_level: z.enum([
    'UNKNOWN_CONGESTION_LEVEL',
    'RUNNING_SMOOTHLY',
    'STOP_AND_GO',
    'CONGESTION',
    'SEVERE_CONGESTION'
  ]).optional(),
  occupancy_status: z.enum([
    'EMPTY',
    'MANY_SEATS_AVAILABLE',
    'FEW_SEATS_AVAILABLE',
    'STANDING_ROOM_ONLY',
    'CRUSHED_STANDING_ROOM_ONLY',
    'FULL',
    'NOT_ACCEPTING_PASSENGERS'
  ]).optional()
});

export default async function (fastify: FastifyInstance) {
  // Get all current vehicle positions
  fastify.get('/', async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'SELECT * FROM vehicle_positions'
      );
      return result.rows;
    } finally {
      client.release();
    }
  });

  // Get position of a specific vehicle
  fastify.get('/:vehicle_id', async (request, reply) => {
    const { vehicle_id } = request.params as { vehicle_id: string };
    const client = await fastify.pg.connect();
    
    try {
      const result = await client.query(
        `SELECT * FROM vehicle_positions WHERE vehicle_id = $1`,
        [vehicle_id]
      );
      
      if (result.rows.length === 0) {
        reply.code(404);
        return { error: 'Vehicle not found' };
      }
      
      return result.rows;
    } finally {
      client.release();
    }
  });

  // Update all vehicle positions
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        properties: {},
        additionalProperties: false
      }
    },
    config: {
      contentType: 'application/json'
    }
  }, async (request, reply) => {
    try {
      const response = await axios.get('https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/x-protobuf',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
        },
        responseType: 'arraybuffer'
      });

      // Load the GTFS-realtime proto definition
      const protoPath = path.join(process.cwd(), 'apps/backend/src/app/proto/gtfs-realtime.proto');
      const root = await protobuf.load(protoPath);
      const FeedMessage = root.lookupType('transit_realtime.FeedMessage');
      
      // Decode the protobuf message
      const message = FeedMessage.decode(new Uint8Array(response.data));
      const feed = FeedMessage.toObject(message, {
        longs: String,
        enums: String,
        bytes: String,
      });

      const positions = [];
      const seenVehicles = new Set();

      // Parse all positions first
      for (const entity of feed.entity) {
        if (entity.vehicle) {
          const vehicle = entity.vehicle;
          const trip = vehicle.trip;
          const position = vehicle.position;

          const vehiclePosition = {
            vehicle_id: vehicle.vehicle?.id || '',
            trip_id: trip?.tripId || '',
            route_id: trip?.routeId || '',
            latitude: position?.latitude || 0,
            longitude: position?.longitude || 0,
            bearing: position?.bearing,
            speed: position?.speed,
            current_stop_id: vehicle.currentStop,
            current_stop_status: vehicle.currentStatus,
            congestion_level: vehicle.congestionLevel,
            occupancy_status: vehicle.occupancyStatus
          };

          // Skip if we've already seen this trip
          if (seenVehicles.has(vehiclePosition.trip_id)) {
            continue;
          }
          seenVehicles.add(vehiclePosition.trip_id);

          // Validate the position data
          const validatedPosition = vehiclePositionSchema.parse(vehiclePosition);
          positions.push(validatedPosition);
        }
      }

      // Batch update all positions
      const client = await fastify.pg.connect();
      try {
        // Start a transaction
        await client.query('BEGIN');

        // Insert or update all positions
        if (positions.length > 0) {
          const values = positions.map((pos, i) => {
            const offset = i * 11;
            return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, 
                    $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, 
                    $${offset + 11})`;
          }).join(',');

          const params = positions.flatMap(pos => [
            pos.vehicle_id,
            pos.trip_id,
            pos.route_id,
            pos.latitude,
            pos.longitude,
            pos.bearing,
            pos.speed,
            pos.current_stop_id,
            pos.current_stop_status,
            pos.congestion_level,
            pos.occupancy_status
          ]);

          await client.query(
            `INSERT INTO vehicle_positions (
              vehicle_id, trip_id, route_id, latitude, longitude, 
              bearing, speed, current_stop_id, current_stop_status,
              congestion_level, occupancy_status
            ) VALUES ${values}
            ON CONFLICT (trip_id) DO UPDATE SET
              vehicle_id = EXCLUDED.vehicle_id,
              route_id = EXCLUDED.route_id,
              latitude = EXCLUDED.latitude,
              longitude = EXCLUDED.longitude,
              bearing = EXCLUDED.bearing,
              speed = EXCLUDED.speed,
              current_stop_id = EXCLUDED.current_stop_id,
              current_stop_status = EXCLUDED.current_stop_status,
              congestion_level = EXCLUDED.congestion_level,
              occupancy_status = EXCLUDED.occupancy_status,
              updated_at = CURRENT_TIMESTAMP`,
            params
          );
        }

        // Commit the transaction
        await client.query('COMMIT');
      } catch (error) {
        // Rollback on error
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

      return { message: 'Positions updated successfully', count: positions.length };
    } catch (error) {
      fastify.log.error('Error updating vehicle positions:', error);
      if (error instanceof Error) {
        fastify.log.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      reply.code(500);
      return { 
        error: 'Failed to update vehicle positions',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
}