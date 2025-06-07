import Fastify from 'fastify';
import postgresPlugin from '../../plugins/postgres';
import 'dotenv/config';

async function main() {
  const server = Fastify({
    logger: {
      level: 'debug',
      transport: {
        target: 'pino-pretty'
      }
    }
  });

  try {
    // Register the existing PostgreSQL plugin
    await server.register(postgresPlugin);
    server.log.info('PostgreSQL plugin registered successfully');

    const client = await server.pg.connect();
    try {
      // Drop existing tables
      server.log.info('Dropping existing tables...');
      await client.query(`
        DROP TABLE IF EXISTS vehicle_positions CASCADE;
        DROP TABLE IF EXISTS trips CASCADE;
        DROP TABLE IF EXISTS stops CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);
      server.log.info('Tables dropped successfully');

      // Create tables
      server.log.info('Creating tables...');
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE stops (
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

        CREATE TABLE trips (
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

        CREATE TABLE vehicle_positions (
          id SERIAL PRIMARY KEY,
          vehicle_id VARCHAR(255) NOT NULL UNIQUE,
          trip_id VARCHAR(255) NOT NULL,
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
      server.log.info('Tables created successfully');
    } finally {
      client.release();
    }

    // Close the server
    await server.close();
    process.exit(0);
  } catch (error) {
    server.log.error('Error during database reset:', error);
    if (error instanceof Error) {
      server.log.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    await server.close();
    process.exit(1);
  }
}

main(); 