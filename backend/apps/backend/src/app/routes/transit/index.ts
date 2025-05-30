import { FastifyInstance } from 'fastify';
import stopsRoutes from './stops';
import tripsRoutes from './trips';
import vehicles from './vehicles';
import sync from './sync';

export default async function (fastify: FastifyInstance) {
  // Register stops routes under /transit/stops
  fastify.register(stopsRoutes, { prefix: '/stops' });
  
  // Register trips routes under /transit/trips
  fastify.register(tripsRoutes, { prefix: '/trips' });

  // Register vehicle routes under /transit/vehicles
  fastify.register(vehicles, { prefix: '/vehicles' });
  
  // Register sync routes under /transit/sync
  fastify.register(sync, { prefix: '/sync' });
}
