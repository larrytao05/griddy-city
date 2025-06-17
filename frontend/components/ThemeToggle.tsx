import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export function ThemeToggle() {
  const { colors, colorScheme, setColorScheme } = useThemeContext();

  const toggleTheme = () => {
    setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  };

  const icon = colorScheme === 'light' ? 'sunny' : 'moon';

  return (
    <Pressable style={[styles.container, { backgroundColor: colors.neutral }]} onPress={toggleTheme}>
        <Ionicons
          name={icon}
          size={22}
          color={colors.neutralOpposite}
        />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5
  }
}); 