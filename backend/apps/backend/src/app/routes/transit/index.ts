import { FastifyInstance } from 'fastify';
import stopsRoutes from './stops';
import tripsRoutes from './trips';
import vehiclePositions from './vehicle-positions';

export default async function (fastify: FastifyInstance) {
  // Register stops routes under /transit/stops
  fastify.register(stopsRoutes, { prefix: '/stops' });
  
  // Register trips routes under /transit/trips
  fastify.register(tripsRoutes, { prefix: '/trips' });

  // Register vehicle positions routes under /transit/vehicles/positions
  fastify.register(vehiclePositions, { prefix: '/vehicles/positions' });
}
