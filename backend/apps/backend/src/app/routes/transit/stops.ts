import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Schema for stop creation/update
const stopSchema = z.object({
  stop_id: z.string(),
  stop_name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  location_type: z.string().optional(),
  parent_station: z.string().optional(),
  transfers: z.array(z.object({
    line_id: z.string(),
    stop_id: z.string(),
    stop_name: z.string(),
    transfer_type: z.string()
  })).optional()
});

export default async function (fastify: FastifyInstance) {
  // Get all stops
  fastify.get('/', async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'SELECT * FROM stops ORDER BY stop_id'
      );
      return result.rows;
    } finally {
      client.release();
    }
  });

  // Get stop by stop ID
  fastify.get('/:stop_id', async (request, reply) => {
    const { stop_id } = request.params as { stop_id: string };
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'SELECT * FROM stops WHERE stop_id = $1',
        [stop_id]
      );
      
      if (result.rows.length === 0) {
        reply.code(404);
        return { error: 'Stop not found' };
      }
      
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Create new stop
  fastify.post('/', async (request, reply) => {
    const stopData = stopSchema.parse(request.body);
    const client = await fastify.pg.connect();
    
    try {
      // Check if stop already exists
      const existingStop = await client.query(
        'SELECT id FROM stops WHERE stop_id = $1',
        [stopData.stop_id]
      );
      
      if (existingStop.rows.length > 0) {
        reply.code(409);
        return { error: 'Stop with this ID already exists' };
      }

      const result = await client.query(
        `INSERT INTO stops (
          stop_id, stop_name, latitude, longitude, 
          location_type, parent_station, transfers
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [
          stopData.stop_id,
          stopData.stop_name,
          stopData.latitude,
          stopData.longitude,
          stopData.location_type,
          stopData.parent_station,
          stopData.transfers || []
        ]
      );
      
      reply.code(201);
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Update stop
  fastify.put('/:stop_id', async (request, reply) => {
    const { stop_id } = request.params as { stop_id: string };
    const updateData = stopSchema.partial().parse(request.body);
    const client = await fastify.pg.connect();
    
    try {
      // Check if stop exists
      const existingStop = await client.query(
        'SELECT stop_id FROM stops WHERE stop_id = $1',
        [stop_id]
      );
      
      if (existingStop.rows.length === 0) {
        reply.code(404);
        return { error: 'Stop not found' };
      }

      // Build update query dynamically based on provided fields
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (updateData.stop_id) {
        updates.push(`stop_id = $${paramCount}`);
        values.push(updateData.stop_id);
        paramCount++;
      }
      if (updateData.stop_name) {
        updates.push(`stop_name = $${paramCount}`);
        values.push(updateData.stop_name);
        paramCount++;
      }
      if (updateData.latitude) {
        updates.push(`latitude = $${paramCount}`);
        values.push(updateData.latitude);
        paramCount++;
      }
      if (updateData.longitude) {
        updates.push(`longitude = $${paramCount}`);
        values.push(updateData.longitude);
        paramCount++;
      }
      if (updateData.location_type !== undefined) {
        updates.push(`location_type = $${paramCount}`);
        values.push(updateData.location_type);
        paramCount++;
      }
      if (updateData.parent_station !== undefined) {
        updates.push(`parent_station = $${paramCount}`);
        values.push(updateData.parent_station);
        paramCount++;
      }
      if (updateData.transfers !== undefined) {
        updates.push(`transfers = $${paramCount}`);
        values.push(updateData.transfers);
        paramCount++;
      }

      if (updates.length === 0) {
        return { message: 'No fields to update' };
      }

      values.push(stop_id);
      const result = await client.query(
        `UPDATE stops SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE stop_id = $${paramCount} 
         RETURNING *`,
        values
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Delete stop
  fastify.delete('/:stop_id', async (request, reply) => {
    const { stop_id } = request.params as { stop_id: string };
    const client = await fastify.pg.connect();
    
    try {
      const result = await client.query(
        'DELETE FROM stops WHERE stop_id = $1 RETURNING stop_id',
        [stop_id]
      );
      
      if (result.rows.length === 0) {
        reply.code(404);
        return { error: 'Stop not found' };
      }
      
      return { message: 'Stop deleted successfully' };
    } finally {
      client.release();
    }
  });
} 