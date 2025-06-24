import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Subway colors for each letter (circle background colors)
const letterColors = {
  // GRIDDY
  G: '#6CBE45', // G train - Light Green
  R: '#FCCC0A', // R train - Yellow
  I: '#EE352E', // 1 train - Red
  D: '#FF6319', // D train - Orange
  D2: '#2850AD', // D train variant - Blue
  Y: '#FCCC0A', // Y (like Q train) - Yellow
  
  // CITY
  C: '#2850AD', // C train - Blue
  I2: '#00933C', // 4 train - Green
  T: '#B933AD', // 7 train - Purple
  Y2: '#996633', // J train - Brown
};

// Helper function to determine text color based on background
const getTextColor = (backgroundColor: string): string => {
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

export function SubwayLogo() {
  return (
    <View style={styles.container}>
      {/* GRIDDY */}
      <View style={styles.wordContainer}>
        <View style={[styles.circle, { backgroundColor: letterColors.G }]}>
          <Text style={[styles.letter, { color: getTextColor(letterColors.G) }]}>G</Text>
        </View>
        <View style={[styles.circle, { backgroundColor: letterColors.R }]}>
          <Text style={[styles.letter, { color: getTextColor(letterColors.R) }]}>R</Text>
        </View>
        <View style={[styles.circle, { backgroundColor: letterColors.I }]}>
          <Text style={[styles.letter, { color: getTextColor(letterColors.I) }]}>I</Text>
        </View>
        <View style={[styles.circle, { backgroundColor: letterColors.D }]}>
          <Text style={[styles.letter, { color: getTextColor(letterColors.D) }]}>D</Text>
        </View>
        <View style={[styles.circle, { backgroundColor: letterColors.D2 }]}>
          <Text style={[styles.letter, { color: getTextColor(letterColors.D2) }]}>D</Text>
        </View>
        <View style={[styles.circle, { backgroundColor: letterColors.Y }]}>
          <Text style={[styles.letter, { color: getTextColor(letterColors.Y) }]}>Y</Text>
        </View>
      </View>
      
      {/* CITY - centered under GRIDDY */}
      <View style={styles.cityContainer}>
        <View style={[styles.circle, { backgroundColor: letterColors.C }]}>
          <Text style={[styles.letter, { color: getTextColor(letterColors.C) }]}>C</Text>
        </View>
        <View style={[styles.circle, { backgroundColor: letterColors.I2 }]}>
          <Text style={[styles.letter, { color: getTextColor(letterColors.I2) }]}>I</Text>
        </View>
        <View style={[styles.circle, { backgroundColor: letterColors.T }]}>
          <Text style={[styles.letter, { color: getTextColor(letterColors.T) }]}>T</Text>
        </View>
        <View style={[styles.circle, { backgroundColor: letterColors.Y2 }]}>
          <Text style={[styles.letter, { color: getTextColor(letterColors.Y2) }]}>Y</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  wordContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    width: 356, // Fixed width for GRIDDY (6 letters * 56px + 5 gaps * 4px)
  },
  cityContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    width: 356, // Same width as GRIDDY container
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  letter: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 