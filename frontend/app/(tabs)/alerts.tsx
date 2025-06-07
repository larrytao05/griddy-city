import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export default function Alerts() {
  const { colors } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral }]}>
      <Text style={[styles.text, { color: colors.neutralOpposite }]}>Alerts Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
  },
}); 