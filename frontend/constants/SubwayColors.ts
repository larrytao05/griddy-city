// MTA Subway Line Colors
export const subwayLineColors: Record<string, string> = {
  // A Division (IRT)
  '1': '#EE352E', // Red
  '2': '#EE352E', // Red
  '3': '#EE352E', // Red
  '4': '#00933C', // Green
  '5': '#00933C', // Green
  '6': '#00933C', // Green
  '7': '#B933AD', // Purple
  'S': '#808183', // Gray (42nd St Shuttle)
  'GS': '#808183', // Gray (Grand Central Shuttle)

  // B Division (BMT/IND)
  'A': '#2850AD', // Blue
  'B': '#FF6319', // Orange
  'C': '#2850AD', // Blue
  'D': '#FF6319', // Orange
  'E': '#2850AD', // Blue
  'F': '#FF6319', // Orange
  'G': '#6CBE45', // Light Green
  'J': '#996633', // Brown
  'L': '#A7A9AC', // Gray
  'M': '#FF6319', // Orange
  'N': '#FCCC0A', // Yellow
  'Q': '#FCCC0A', // Yellow
  'R': '#FCCC0A', // Yellow
  'W': '#FCCC0A', // Yellow
  'Z': '#996633', // Brown

  // Staten Island Railway
  'SIR': '#002D72', // Dark Blue
};

// Helper function to get line color
export const getLineColor = (line: string): string => {
  return subwayLineColors[line] || '#808183'; // Default to gray if line not found
};

// Helper function to get text color based on background color
export const getTextColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}; 