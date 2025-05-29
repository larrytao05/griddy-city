import { FastifyInstance } from 'fastify';

// Function for creating tables with static data
export async function createStaticTables(fastify: FastifyInstance) {
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
    // Create vehicle positions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicle_positions (
        id SERIAL PRIMARY KEY,
        vehicle_id VARCHAR(255) NOT NULL,
        trip_id VARCHAR(255) NOT NULL UNIQUE,
        route_id VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        bearing FLOAT,
        speed FLOAT,
        current_stop_id VARCHAR(255),
        current_stop_status VARCHAR(50),
        congestion_level VARCHAR(50),
        occupancy_status VARCHAR(50),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    fastify.log.info('All tables created successfully');
  } finally {
    client.release();
  }
} 

// Separate function for real-time data tables
export async function createRealtimeTable(fastify: FastifyInstance) {
  const client = await fastify.pg.connect();

  try {
    // Drop the table if it exists to ensure fresh start
    await client.query('DROP TABLE IF EXISTS vehicle_positions');

    // Create vehicle positions table
    await client.query(`
      CREATE TABLE vehicle_positions (
        id SERIAL PRIMARY KEY,
        vehicle_id VARCHAR(255) NOT NULL,
        trip_id VARCHAR(255) NOT NULL UNIQUE,
        route_id VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        bearing FLOAT,
        speed FLOAT,
        current_stop_id VARCHAR(255),
        current_stop_status VARCHAR(50),
        congestion_level VARCHAR(50),
        occupancy_status VARCHAR(50),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    fastify.log.info('Realtime table created successfully');
  } finally {
    client.release();
  }
}