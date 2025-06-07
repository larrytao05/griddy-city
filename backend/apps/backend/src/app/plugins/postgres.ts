import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';
import 'dotenv/config';
import { createStaticTables, createRealtimeTable } from '../db/schema';

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify: FastifyInstance) {
  fastify.register(fastifyPostgres, {
    connectionString: process.env.DATABASE_URL,
  });

  // Create tables when the server starts
  fastify.addHook('onReady', async () => {
    try {
      await createStaticTables(fastify);
      await createRealtimeTable(fastify);
      fastify.log.info('Database tables created successfully');
    } catch (error) {
      fastify.log.error('Error creating database tables:', error);
      throw error;
    }
  });
});
