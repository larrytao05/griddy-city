import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parse/sync';

// Types
interface ShapePoint {
  shape_id: string;
  shape_pt_sequence: string;
  shape_pt_lat: string;
  shape_pt_lon: string;
}

interface Trip {
  route_id: string;
  trip_id: string;
  service_id: string;
  trip_headsign?: string;
  direction_id?: string;
  shape_id: string;
}

interface Route {
  agency_id: string;
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type: string;
  route_desc?: string;
  route_url?: string;
  route_color?: string;
  route_text_color?: string;
}

// File paths
const gtfsDir = path.join(__dirname, '../../../../resources/gtfs_subway');
const shapesPath = path.join(gtfsDir, 'shapes.txt');
const tripsPath = path.join(gtfsDir, 'trips.txt');
const routesPath = path.join(gtfsDir, 'routes.txt');
const outputPath = path.join(__dirname, 'gtfs_shapes_by_line.json');

// Read and parse CSVs
function parseCSV(filePath: string) {
  const data = fs.readFileSync(filePath, 'utf-8');
  return csv.parse(data, { columns: true, skip_empty_lines: true });
}

const shapes = parseCSV(shapesPath) as ShapePoint[];
const trips = parseCSV(tripsPath) as Trip[];
const routes = parseCSV(routesPath) as Route[];

// Map shape_id -> array of points
const shapeIdToPoints: Record<string, { lat: number; lon: number; seq: number }[]> = {};
for (const row of shapes) {
  if (!shapeIdToPoints[row.shape_id]) shapeIdToPoints[row.shape_id] = [];
  shapeIdToPoints[row.shape_id].push({
    lat: parseFloat(row.shape_pt_lat),
    lon: parseFloat(row.shape_pt_lon),
    seq: parseInt(row.shape_pt_sequence, 10),
  });
}
// Sort points by sequence
for (const points of Object.values(shapeIdToPoints)) {
  points.sort((a, b) => a.seq - b.seq);
}

// Map shape_id -> route_id (using first trip found for each shape_id)
const shapeIdToRouteId: Record<string, string> = {};
for (const trip of trips) {
  if (trip.shape_id && trip.route_id && !shapeIdToRouteId[trip.shape_id]) {
    shapeIdToRouteId[trip.shape_id] = trip.route_id;
  }
}

// Map route_id -> route_short_name (e.g., "A", "1")
const routeIdToShortName: Record<string, string> = {};
for (const route of routes) {
  routeIdToShortName[route.route_id] = route.route_short_name;
}

// Build final mapping: line -> array of shapes (each shape is array of {lat, lon})
const lineToShapes: Record<string, { lat: number; lon: number }[][]> = {};
for (const [shape_id, points] of Object.entries(shapeIdToPoints)) {
  const route_id = shapeIdToRouteId[shape_id];
  const line = routeIdToShortName[route_id];
  if (!line) continue;
  if (!lineToShapes[line]) lineToShapes[line] = [];
  lineToShapes[line].push(points.map(({ lat, lon }) => ({ lat, lon })));
}

// Write output
fs.writeFileSync(outputPath, JSON.stringify(lineToShapes, null, 2));
console.log(`Exported GTFS shapes by line to ${outputPath}`); 