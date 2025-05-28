import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parse/sync';
import { createTables } from '../schema';

interface GTFSStop {
  stop_id: string;
  stop_name: string;
  stop_lat: string;
  stop_lon: string;
  location_type?: string;
  parent_station?: string;
}

interface GTFSStopTime {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: string;
}

interface GTFSTrip {
  trip_id: string;
  route_id: string;
  service_id: string;
  trip_headsign?: string;
  direction_id?: string;
  shape_id?: string;
}

interface GTFSTransfer {
  from_stop_id: string;
  to_stop_id: string;
  transfer_type: string;
  min_transfer_time?: string;
}

export async function importGTFSData(fastify: FastifyInstance, gtfsPath: string) {
  let client;
  try {
    fastify.log.info('Starting GTFS data import...');
    
    client = await fastify.pg.connect();
    await createTables(fastify);
    
    const stopsPath = path.join(gtfsPath, 'stops.txt');
    const stopTimesPath = path.join(gtfsPath, 'stop_times.txt');
    const tripsPath = path.join(gtfsPath, 'trips.txt');
    const transfersPath = path.join(gtfsPath, 'transfers.txt');

    // Check if files exist
    if (!fs.existsSync(stopsPath)) {
      throw new Error(`stops.txt not found at ${stopsPath}`);
    }
    if (!fs.existsSync(stopTimesPath)) {
      throw new Error(`stop_times.txt not found at ${stopTimesPath}`);
    }
    if (!fs.existsSync(tripsPath)) {
      throw new Error(`trips.txt not found at ${tripsPath}`);
    }
    if (!fs.existsSync(transfersPath)) {
      throw new Error(`transfers.txt not found at ${transfersPath}`);
    }

    const stopsData = fs.readFileSync(stopsPath, 'utf-8');
    const stopTimesData = fs.readFileSync(stopTimesPath, 'utf-8');
    const tripsData = fs.readFileSync(tripsPath, 'utf-8');
    const transfersData = fs.readFileSync(transfersPath, 'utf-8');

    const stops = csv.parse(stopsData, {
      columns: true,
      skip_empty_lines: true
    }) as GTFSStop[];

    const stopTimes = csv.parse(stopTimesData, {
      columns: true,
      skip_empty_lines: true
    }) as GTFSStopTime[];

    const trips = csv.parse(tripsData, {
      columns: true,
      skip_empty_lines: true
    }) as GTFSTrip[];

    const transfers = csv.parse(transfersData, {
      columns: true,
      skip_empty_lines: true
    }) as GTFSTransfer[];

    // Create a map of stops for quick lookup
    const stopsMap = new Map(stops.map(stop => [stop.stop_id, stop]));

    // Process transfers and group them by from_stop_id
    const transfersByStop = transfers.reduce((acc, transfer) => {
      if (!acc[transfer.from_stop_id]) {
        acc[transfer.from_stop_id] = [];
      }
      
      const toStop = stopsMap.get(transfer.to_stop_id);
      if (toStop) {
        acc[transfer.from_stop_id].push({
          stop_id: transfer.to_stop_id,
          stop_name: toStop.stop_name,
          transfer_type: transfer.transfer_type,
          min_transfer_time: transfer.min_transfer_time ? parseInt(transfer.min_transfer_time) : undefined
        });
      }
      return acc;
    }, {} as Record<string, any[]>);

    // Import stops with their transfers
    for (const stop of stops) {
      const stopTransfers = transfersByStop[stop.stop_id] || [];
      const params = [
        stop.stop_id,
        stop.stop_name,
        parseFloat(stop.stop_lat),
        parseFloat(stop.stop_lon),
        stop.location_type || null,
        stop.parent_station || null,
        JSON.stringify(stopTransfers)
      ];
      
      await client.query(
        `INSERT INTO stops (
          stop_id, stop_name, latitude, longitude,
          location_type, parent_station, transfers
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (stop_id) DO UPDATE SET
          stop_name = EXCLUDED.stop_name,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          location_type = EXCLUDED.location_type,
          parent_station = EXCLUDED.parent_station,
          transfers = EXCLUDED.transfers,
          updated_at = CURRENT_TIMESTAMP`,
        params
      );
    }

    // Group stop times by trip_id
    const stopTimesByTrip = stopTimes.reduce((acc, stopTime) => {
      if (!acc[stopTime.trip_id]) {
        acc[stopTime.trip_id] = [];
      }
      acc[stopTime.trip_id].push({
        stop_id: stopTime.stop_id,
        arrival_time: stopTime.arrival_time,
        departure_time: stopTime.departure_time,
        stop_sequence: parseInt(stopTime.stop_sequence)
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Import trips with their stops
    for (const trip of trips) {
      const tripStops = stopTimesByTrip[trip.trip_id] || [];
      await client.query(
        `INSERT INTO trips (
          trip_id, route_id, service_id, trip_headsign,
          direction_id, shape_id, stops
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (trip_id) DO UPDATE SET
          route_id = EXCLUDED.route_id,
          service_id = EXCLUDED.service_id,
          trip_headsign = EXCLUDED.trip_headsign,
          direction_id = EXCLUDED.direction_id,
          shape_id = EXCLUDED.shape_id,
          stops = EXCLUDED.stops,
          updated_at = CURRENT_TIMESTAMP`,
        [
          trip.trip_id,
          trip.route_id,
          trip.service_id,
          trip.trip_headsign || null,
          trip.direction_id || null,
          trip.shape_id || null,
          JSON.stringify(tripStops)
        ]
      );
    }

    fastify.log.info('GTFS data import completed successfully');
  } catch (error) {
    fastify.log.error('Error during GTFS import:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
} 