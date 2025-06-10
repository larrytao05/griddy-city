import Fastify from 'fastify';
import { importGTFSData } from './import-gtfs';
import 'dotenv/config';
import postgresPlugin from '../../plugins/postgres';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const server = Fastify({
    logger: {
      level: 'debug'
    }
  });

  try {
    // Register the existing PostgreSQL plugin
    await server.register(postgresPlugin);
    server.log.info('PostgreSQL plugin registered successfully');

    // Get the GTFS data path from command line argument or use default
    const gtfsPath = process.argv[2] || path.join(__dirname, '../../../../resources/gtfs_subway');
    server.log.info(`Using GTFS data path: ${gtfsPath}`);
    
    // Verify the path exists
    if (!fs.existsSync(gtfsPath)) {
      throw new Error(`GTFS directory does not exist: ${gtfsPath}`);
    }
    
    // List files in the directory
    const files = fs.readdirSync(gtfsPath);
    server.log.info('Files found in GTFS directory:', files);
    
    // Import the data
    await importGTFSData(server, gtfsPath);
    
    // Close the server
    await server.close();
    process.exit(0);
  } catch (error) {
    server.log.error('Error during import:', error);
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