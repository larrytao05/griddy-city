import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { TabButton } from './TabButton';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export function TabBar({ state }: BottomTabBarProps) {
  const { colors } = useThemeContext();

  const icons = [
    { 
        filled: 'map' as const,
        outline: 'map-outline' as const
    },
    { 
        filled: 'navigate' as const,
        outline: 'navigate-outline' as const
    },
    { 
        filled: 'alert-circle' as const,
        outline: 'alert-circle-outline' as const
    },
  ];

  const labels = [
    'Map',
    'Routes',
    'Alerts'
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral }]}>
      {icons.map((icon, index) => (
        <TabButton
          key={index}
          icon={state.index === index ? icon.filled : icon.outline}
          label={labels[index]}
          isActive={state.index === index}
          href={`/(tabs)/${state.routes[index].name}` as '/(tabs)/map' | '/(tabs)/routes' | '/(tabs)/alerts'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 96,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
}); 