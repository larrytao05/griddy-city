import { execSync } from 'child_process';
import { app } from './app/app';
import Fastify from 'fastify';

async function main() {
  try {
    console.log('Starting GTFS import...');
    // Use the compiled import script directly with error capture
    try {
      const output = execSync('node dist/apps/backend/src/app/db/scripts/import-gtfs-cli.js', { 
        encoding: 'utf8',
        env: {
          ...process.env,
          NODE_ENV: 'production'
        }
      });
      console.log(output);
      console.log('✅ GTFS import completed successfully');
    } catch (error) {
      console.error('❌ GTFS import failed:');
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        if ('stdout' in error) {
          console.error('stdout:', (error as any).stdout?.toString());
        }
        if ('stderr' in error) {
          console.error('stderr:', (error as any).stderr?.toString());
        }
      }
      // Continue anyway since we want the server to start
    }

    const host = process.env.HOST ?? 'localhost';
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;

    const server = Fastify({
      logger: {
        level: 'debug'
      }
    });

    server.register(app);

    await server.listen({ port, host });
    console.log(`[ ready ] http://${host}:${port}`);
  } catch (error) {
    console.error('Error during startup:', error);
    process.exit(1);
  }
}

main(); 