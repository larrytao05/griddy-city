export const Colors = {
  light: {
    accent: '#197AFA',
    secondaryAccent: '#E36729',
    lightAccent: '#9EC8FF',
    neutral: '#FAFAFA',
    neutralMid: '#DEDEDE',
    neutralOpposite: '#121212',
  },
  dark: {
    accent: '#197AFA',
    secondaryAccent: '#E36729',
    lightAccent: '#9EC8FF',
    neutral: '#121212',
    neutralMid: '#3D3D3D',
    neutralOpposite: '#FAFAFA',
  },
};

// Type for the color scheme
export type ColorScheme = 'light' | 'dark';

// Helper function to get colors based on scheme
export const getColors = (scheme: ColorScheme) => Colors[scheme]; 