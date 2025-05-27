import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';
import 'dotenv/config';

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify: FastifyInstance) {
  fastify.register(fastifyPostgres, {
    connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5432/${process.env.POSTGRES_DB}`,
  });
});
