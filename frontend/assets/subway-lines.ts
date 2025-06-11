import { markers } from './markers';

export const LINE_COLORS: Record<string, string> = {
  'A': '#2850AD',    // Blue
  'B': '#FF6319',    // Orange
  'C': '#2850AD',    // Blue
  'D': '#FF6319',    // Orange
  'E': '#2850AD',    // Blue
  'F': '#FF6319',    // Orange
  'G': '#6CBE45',    // Green
  'J': '#996633',    // Brown
  'L': '#A7A9AC',    // Grey
  'M': '#FF6319',    // Orange
  'N': '#FCCC0A',    // Yellow
  'Q': '#FCCC0A',    // Yellow
  'R': '#FCCC0A',    // Yellow
  'S': '#808183',    // Grey
  'W': '#FCCC0A',    // Yellow
  'Z': '#996633',    // Brown
  '1': '#EE352E',    // Red
  '2': '#EE352E',    // Red
  '3': '#EE352E',    // Red
  '4': '#00933C',    // Green
  '5': '#00933C',    // Green
  '6': '#00933C',    // Green
  '7': '#B933AD',    // Purple
};

// Function to get line from stop ID
const getLineFromStopId = (stopId: string): string => {
  const match = stopId.match(/^([A-Z0-9])/);
  return match ? match[1] : '';
};

// Pre-compute the line data
const lines: Record<string, any[]> = {};

markers.forEach(marker => {
  marker.stops.forEach((stop: any) => {
    const line = getLineFromStopId(stop.stop_id);
    if (line) {
      if (!lines[line]) {
        lines[line] = [];
      }
      // Only add if not already in the array
      if (!lines[line].some((s: any) => s.stop_id === stop.stop_id)) {
        lines[line].push({
          ...stop,
          station_name: marker.station_name
        });
      }
    }
  });
});

// Sort stops within each line by their sequence
Object.keys(lines).forEach(line => {
  lines[line].sort((a, b) => {
    const aNum = parseInt(a.stop_id.replace(/[^0-9]/g, ''));
    const bNum = parseInt(b.stop_id.replace(/[^0-9]/g, ''));
    return aNum - bNum;
  });
});

export const SUBWAY_LINES = lines; 