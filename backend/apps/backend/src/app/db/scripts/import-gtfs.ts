import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parse/sync';
import { createStaticTables } from '../schema';

interface GTFSStop {
  stop_id: string;
  stop_name: string;
  stop_lat: string;
  stop_lon: string;
  location_type?: string;
  parent_station?: string;
  direction_id?: string;
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

interface Station {
  station_id: string;
  station_name: string;
  latitude: number;
  longitude: number;
  transfers: any[];
  stops: GTFSStop[];
}

export async function importGTFSData(fastify: FastifyInstance, gtfsPath: string) {
  let client;
  try {
    fastify.log.info('Starting GTFS data import...');
    
    client = await fastify.pg.connect();
    await createStaticTables(fastify);
    
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

    // Group stops by station
    const stations = new Map<string, Station>();
    
    for (const stop of stops) {
      // Use stop_name as station identifier
      const stationName = stop.stop_name;
      
      if (!stations.has(stationName)) {
        stations.set(stationName, {
          station_id: `station_${stationName.replace(/\s+/g, '_').toLowerCase()}`,
          station_name: stationName,
          latitude: parseFloat(stop.stop_lat),
          longitude: parseFloat(stop.stop_lon),
          transfers: [],
          stops: []
        });
      }
      
      const station = stations.get(stationName)!;
      station.stops.push(stop);
    }

    // Process transfers and group them by station
    const transfersByStation = transfers.reduce((acc, transfer) => {
      const fromStop = stops.find(s => s.stop_id === transfer.from_stop_id);
      const toStop = stops.find(s => s.stop_id === transfer.to_stop_id);
      
      if (fromStop && toStop) {
        const fromStationName = fromStop.stop_name;
        if (!acc[fromStationName]) {
          acc[fromStationName] = [];
        }
        
        acc[fromStationName].push({
          station_id: `station_${toStop.stop_name.replace(/\s+/g, '_').toLowerCase()}`,
          station_name: toStop.stop_name,
          transfer_type: transfer.transfer_type,
          min_transfer_time: transfer.min_transfer_time ? parseInt(transfer.min_transfer_time) : undefined
        });
      }
      return acc;
    }, {} as Record<string, any[]>);

    // Import stations
    for (const [stationName, station] of stations) {
      const stationTransfers = transfersByStation[stationName] || [];
      
      await client.query(
        `INSERT INTO stations (
          station_id, station_name, latitude, longitude, transfers
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (station_id) DO UPDATE SET
          station_name = EXCLUDED.station_name,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          transfers = EXCLUDED.transfers,
          updated_at = CURRENT_TIMESTAMP`,
        [
          station.station_id,
          station.station_name,
          station.latitude,
          station.longitude,
          JSON.stringify(stationTransfers)
        ]
      );

      // Import child stops
      for (const stop of station.stops) {
        await client.query(
          `INSERT INTO stops (
            stop_id, stop_name, station_id, direction_id,
            latitude, longitude
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (stop_id) DO UPDATE SET
            stop_name = EXCLUDED.stop_name,
            station_id = EXCLUDED.station_id,
            direction_id = EXCLUDED.direction_id,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            updated_at = CURRENT_TIMESTAMP`,
          [
            stop.stop_id,
            stop.stop_name,
            station.station_id,
            stop.direction_id || '0', // Default to 0 if not specified
            parseFloat(stop.stop_lat),
            parseFloat(stop.stop_lon)
          ]
        );
      }
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