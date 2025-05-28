import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Schema for stop information within a trip
const stopInfoSchema = z.object({
  stop_id: z.string(),
  arrival_time: z.string(),
  departure_time: z.string(),
  stop_sequence: z.number()
});

// Schema for trip creation/update
const tripSchema = z.object({
  trip_id: z.string(),
  route_id: z.string(),
  service_id: z.string(),
  trip_headsign: z.string().optional(),
  direction_id: z.string().optional(),
  shape_id: z.string().optional(),
  stops: z.array(stopInfoSchema).optional()
});

export default async function (fastify: FastifyInstance) {
  // Get all trips
  fastify.get('/', async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'SELECT * FROM trips ORDER BY trip_id'
      );
      return result.rows;
    } finally {
      client.release();
    }
  });

  // Get trip by trip ID
  fastify.get('/:trip_id', async (request, reply) => {
    const { trip_id } = request.params as { trip_id: string };
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'SELECT * FROM trips WHERE trip_id = $1',
        [trip_id]
      );
      
      if (result.rows.length === 0) {
        reply.code(404);
        return { error: 'Trip not found' };
      }
      
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Create new trip
  fastify.post('/', async (request, reply) => {
    const tripData = tripSchema.parse(request.body);
    const client = await fastify.pg.connect();
    
    try {
      // Check if trip already exists
      const existingTrip = await client.query(
        'SELECT id FROM trips WHERE trip_id = $1',
        [tripData.trip_id]
      );
      
      if (existingTrip.rows.length > 0) {
        reply.code(409);
        return { error: 'Trip with this ID already exists' };
      }

      const result = await client.query(
        `INSERT INTO trips (
          trip_id, route_id, service_id, trip_headsign,
          direction_id, shape_id, stops
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [
          tripData.trip_id,
          tripData.route_id,
          tripData.service_id,
          tripData.trip_headsign,
          tripData.direction_id,
          tripData.shape_id,
          tripData.stops || []
        ]
      );
      
      reply.code(201);
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Update trip
  fastify.put('/:trip_id', async (request, reply) => {
    const { trip_id } = request.params as { trip_id: string };
    const updateData = tripSchema.partial().parse(request.body);
    const client = await fastify.pg.connect();
    
    try {
      // Check if trip exists
      const existingTrip = await client.query(
        'SELECT id FROM trips WHERE trip_id = $1',
        [trip_id]
      );
      
      if (existingTrip.rows.length === 0) {
        reply.code(404);
        return { error: 'Trip not found' };
      }

      // Build update query dynamically based on provided fields
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (updateData.trip_id) {
        updates.push(`trip_id = $${paramCount}`);
        values.push(updateData.trip_id);
        paramCount++;
      }
      if (updateData.route_id) {
        updates.push(`route_id = $${paramCount}`);
        values.push(updateData.route_id);
        paramCount++;
      }
      if (updateData.service_id) {
        updates.push(`service_id = $${paramCount}`);
        values.push(updateData.service_id);
        paramCount++;
      }
      if (updateData.trip_headsign !== undefined) {
        updates.push(`trip_headsign = $${paramCount}`);
        values.push(updateData.trip_headsign);
        paramCount++;
      }
      if (updateData.direction_id !== undefined) {
        updates.push(`direction_id = $${paramCount}`);
        values.push(updateData.direction_id);
        paramCount++;
      }
      if (updateData.shape_id !== undefined) {
        updates.push(`shape_id = $${paramCount}`);
        values.push(updateData.shape_id);
        paramCount++;
      }
      if (updateData.stops !== undefined) {
        updates.push(`stops = $${paramCount}`);
        values.push(updateData.stops);
        paramCount++;
      }

      if (updates.length === 0) {
        return { message: 'No fields to update' };
      }
      values.push(trip_id);
      const result = await client.query(
        `UPDATE trips SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE trip_id = $${paramCount} 
         RETURNING *`,
        values
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Delete trip
  fastify.delete('/:trip_id', async (request, reply) => {
    const { trip_id } = request.params as { trip_id: string };
    const client = await fastify.pg.connect();
    
    try {
      const result = await client.query(
        'DELETE FROM trips WHERE trip_id = $1 RETURNING trip_id',
        [trip_id]
      );
      
      if (result.rows.length === 0) {
        reply.code(404);
        return { error: 'Trip not found' };
      }
      
      return { message: 'Trip deleted successfully' };
    } finally {
      client.release();
    }
  });
} 