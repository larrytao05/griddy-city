import { FastifyInstance } from 'fastify';
import { z } from 'zod';

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
  // Get all vehicle positions
  fastify.get('/', async (request, reply) => {
    try {
      const result = await fastify.pg.query(
        'SELECT * FROM vehicle_positions ORDER BY updated_at DESC'
      );
      return result.rows;
    } catch (error) {
      fastify.log.error('Error fetching vehicle positions:', error);
      reply.code(500);
      return { error: 'Failed to fetch vehicle positions' };
    }
  });

  // Get vehicle position by trip ID
  fastify.get('/:tripId', async (request, reply) => {
    const { tripId } = request.params as { tripId: string };
    try {
      const result = await fastify.pg.query(
        'SELECT * FROM vehicle_positions WHERE trip_id = $1',
        [tripId]
      );
      if (result.rows.length === 0) {
        reply.code(404);
        return { error: 'Vehicle position not found' };
      }
      return result.rows[0];
    } catch (error) {
      fastify.log.error('Error fetching vehicle position:', error);
      reply.code(500);
      return { error: 'Failed to fetch vehicle position' };
    }
  });

  // Update vehicle position
  fastify.post('/', async (request, reply) => {
    try {
      const position = vehiclePositionSchema.parse(request.body);
      
      const result = await fastify.pg.query(
        `INSERT INTO vehicle_positions (
          vehicle_id, trip_id, route_id, latitude, longitude,
          bearing, speed, current_stop_id, current_stop_status,
          congestion_level, occupancy_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
          updated_at = CURRENT_TIMESTAMP
        RETURNING *`,
        [
          position.vehicle_id,
          position.trip_id,
          position.route_id,
          position.latitude,
          position.longitude,
          position.bearing,
          position.speed,
          position.current_stop_id,
          position.current_stop_status,
          position.congestion_level,
          position.occupancy_status
        ]
      );

      return result.rows[0];
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400);
        return { error: 'Invalid vehicle position data', details: error.errors };
      }
      fastify.log.error('Error updating vehicle position:', error);
      reply.code(500);
      return { error: 'Failed to update vehicle position' };
    }
  });
} 