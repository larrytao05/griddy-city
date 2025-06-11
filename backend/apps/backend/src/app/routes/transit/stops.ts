import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Schema for station creation/update
const stationSchema = z.object({
  station_id: z.string(),
  station_name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  transfers: z.array(z.object({
    station_id: z.string(),
    station_name: z.string(),
    transfer_type: z.string(),
    min_transfer_time: z.number().optional()
  })).optional()
});

// Schema for stop creation/update
const stopSchema = z.object({
  stop_id: z.string(),
  stop_name: z.string(),
  station_id: z.string(),
  direction_id: z.string(),
  latitude: z.number(),
  longitude: z.number()
});

export default async function (fastify: FastifyInstance) {
  // Get all stations with their stops
  fastify.get('/stations', async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(`
        SELECT s.*, 
          json_agg(json_build_object(
            'stop_id', st.stop_id,
            'stop_name', st.stop_name,
            'direction_id', st.direction_id,
            'latitude', st.latitude,
            'longitude', st.longitude
          )) as stops
        FROM stations s
        LEFT JOIN stops st ON s.station_id = st.station_id
        GROUP BY s.id, s.station_id, s.station_name, s.latitude, s.longitude, s.transfers, s.created_at, s.updated_at
        ORDER BY s.station_name
      `);
      return result.rows;
    } finally {
      client.release();
    }
  });

  // Get station by ID with its stops
  fastify.get('/stations/:station_id', async (request, reply) => {
    const { station_id } = request.params as { station_id: string };
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(`
        SELECT s.*, 
          json_agg(json_build_object(
            'stop_id', st.stop_id,
            'stop_name', st.stop_name,
            'direction_id', st.direction_id,
            'latitude', st.latitude,
            'longitude', st.longitude
          )) as stops
        FROM stations s
        LEFT JOIN stops st ON s.station_id = st.station_id
        WHERE s.station_id = $1
        GROUP BY s.id, s.station_id, s.station_name, s.latitude, s.longitude, s.transfers, s.created_at, s.updated_at
      `, [station_id]);
      
      if (result.rows.length === 0) {
        reply.code(404);
        return { error: 'Station not found' };
      }
      
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Get all stops
  fastify.get('/stops', async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(`
        SELECT st.*, s.station_name
        FROM stops st
        JOIN stations s ON st.station_id = s.station_id
        ORDER BY st.stop_id
      `);
      return result.rows;
    } finally {
      client.release();
    }
  });

  // Get stop by ID
  fastify.get('/stops/:stop_id', async (request, reply) => {
    const { stop_id } = request.params as { stop_id: string };
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(`
        SELECT st.*, s.station_name
        FROM stops st
        JOIN stations s ON st.station_id = s.station_id
        WHERE st.stop_id = $1
      `, [stop_id]);
      
      if (result.rows.length === 0) {
        reply.code(404);
        return { error: 'Stop not found' };
      }
      
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Create new station
  fastify.post('/stations', async (request, reply) => {
    const stationData = stationSchema.parse(request.body);
    const client = await fastify.pg.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO stations (
          station_id, station_name, latitude, longitude, transfers
        ) VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`,
        [
          stationData.station_id,
          stationData.station_name,
          stationData.latitude,
          stationData.longitude,
          stationData.transfers || []
        ]
      );
      
      reply.code(201);
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Create new stop
  fastify.post('/stops', async (request, reply) => {
    const stopData = stopSchema.parse(request.body);
    const client = await fastify.pg.connect();
    
    try {
      // Verify station exists
      const station = await client.query(
        'SELECT station_id FROM stations WHERE station_id = $1',
        [stopData.station_id]
      );
      
      if (station.rows.length === 0) {
        reply.code(404);
        return { error: 'Parent station not found' };
      }

      const result = await client.query(
        `INSERT INTO stops (
          stop_id, stop_name, station_id, direction_id,
          latitude, longitude
        ) VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
        [
          stopData.stop_id,
          stopData.stop_name,
          stopData.station_id,
          stopData.direction_id,
          stopData.latitude,
          stopData.longitude
        ]
      );
      
      reply.code(201);
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Update station
  fastify.put('/stations/:station_id', async (request, reply) => {
    const { station_id } = request.params as { station_id: string };
    const updateData = stationSchema.partial().parse(request.body);
    const client = await fastify.pg.connect();
    
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (updateData.station_name) {
        updates.push(`station_name = $${paramCount}`);
        values.push(updateData.station_name);
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
      if (updateData.transfers !== undefined) {
        updates.push(`transfers = $${paramCount}`);
        values.push(updateData.transfers);
        paramCount++;
      }

      if (updates.length === 0) {
        return { message: 'No fields to update' };
      }

      values.push(station_id);
      const result = await client.query(
        `UPDATE stations SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE station_id = $${paramCount} 
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        reply.code(404);
        return { error: 'Station not found' };
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Update stop
  fastify.put('/stops/:stop_id', async (request, reply) => {
    const { stop_id } = request.params as { stop_id: string };
    const updateData = stopSchema.partial().parse(request.body);
    const client = await fastify.pg.connect();
    
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (updateData.stop_name) {
        updates.push(`stop_name = $${paramCount}`);
        values.push(updateData.stop_name);
        paramCount++;
      }
      if (updateData.station_id) {
        updates.push(`station_id = $${paramCount}`);
        values.push(updateData.station_id);
        paramCount++;
      }
      if (updateData.direction_id) {
        updates.push(`direction_id = $${paramCount}`);
        values.push(updateData.direction_id);
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

      if (result.rows.length === 0) {
        reply.code(404);
        return { error: 'Stop not found' };
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Delete station (will cascade delete stops)
  fastify.delete('/stations/:station_id', async (request, reply) => {
    const { station_id } = request.params as { station_id: string };
    const client = await fastify.pg.connect();
    
    try {
      const result = await client.query(
        'DELETE FROM stations WHERE station_id = $1 RETURNING station_id',
        [station_id]
      );
      
      if (result.rows.length === 0) {
        reply.code(404);
        return { error: 'Station not found' };
      }
      
      return { message: 'Station and its stops deleted successfully' };
    } finally {
      client.release();
    }
  });

  // Delete stop
  fastify.delete('/stops/:stop_id', async (request, reply) => {
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