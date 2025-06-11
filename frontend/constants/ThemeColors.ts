export const Colors = {
  light: {
    accent: '#197AFA',
    secondaryAccent: '#E36729',
    lightAccent: '#6EABFA',
    neutral: '#FAFAFA',
    neutralMid: '#E0E0E0',
    neutralOpposite: '#121212',
  },
  dark: {
    accent: '#197AFA',
    secondaryAccent: '#E36729',
    lightAccent: '#6EABFA',
    neutral: '#121212',
    neutralMid: '#3D3D3D',
    neutralOpposite: '#FAFAFA',
  },
};

// Type for the color scheme
export type ColorScheme = 'light' | 'dark';

// Helper function to get colors based on scheme
export const getColors = (scheme: ColorScheme) => Colors[scheme]; 