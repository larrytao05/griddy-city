import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export default function NotFound() {
  const { colors } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral }]}>
      <Text style={[styles.title, { color: colors.neutralOpposite }]}>
        Page Not Found
      </Text>
      <Text style={[styles.message, { color: colors.neutralOpposite }]}>
        The page you're looking for doesn't exist.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});
