import { FastifyInstance } from 'fastify';

export async function createTables(fastify: FastifyInstance) {
  const client = await fastify.pg.connect();

  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Create stops table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stops (
        id SERIAL PRIMARY KEY,
        stop_id VARCHAR(255) UNIQUE NOT NULL,
        stop_name VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        location_type VARCHAR(255),
        parent_station VARCHAR(255),
        transfers JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Create trips table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id SERIAL PRIMARY KEY,
        trip_id VARCHAR(255) UNIQUE NOT NULL,
        route_id VARCHAR(255) NOT NULL,
        service_id VARCHAR(255) NOT NULL,
        trip_headsign VARCHAR(255),
        direction_id VARCHAR(255),
        shape_id VARCHAR(255),
        stops JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    fastify.log.info('Users table created successfully');
  } finally {
    client.release();
  }
} 