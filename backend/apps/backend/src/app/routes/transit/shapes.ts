import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const { line } = request.query as { line?: string };
    const shapesPath = path.join(__dirname, '../../db/scripts/gtfs_shapes_by_line.json');
    console.log('Resolved shapesPath:', shapesPath);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(shapesPath, 'utf-8'));
    } catch (err) {
      const error = err as Error;
      console.error('Error loading shapes data:', error);
      return reply.status(500).send({ error: 'Could not load shapes data', details: error.message });
    }
    if (line) {
      if (!data[line]) {
        return reply.status(404).send({ error: `No shapes found for line ${line}` });
      }
      return { line, shapes: data[line] };
    }
    return data;
  });
} 