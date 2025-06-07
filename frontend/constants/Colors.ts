export const Colors = {
  light: {
    accent: '#197AFA',
    secondaryAccent: '#E36729',
    lightAccent: '#6EABFA',
    neutral: '#FAFAFA',
    neutralOpposite: '#121212',
  },
  dark: {
    accent: '#197AFA',
    secondaryAccent: '#E36729',
    lightAccent: '#6EABFA',
    neutral: '#121212',
    neutralOpposite: '#FAFAFA',
  },
};

// Type for the color scheme
export type ColorScheme = 'light' | 'dark';

// Helper function to get colors based on scheme
export const getColors = (scheme: ColorScheme) => Colors[scheme]; 