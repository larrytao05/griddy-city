import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';
import { Link } from 'expo-router';

type TabButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isActive: boolean;
  href: '/(tabs)/map' | '/(tabs)/routes' | '/(tabs)/alerts';
};

export function TabButton({ icon, label, isActive, href }: TabButtonProps) {
  const { colors } = useThemeContext();
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.8)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1 : 0.8,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: isActive ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive, scaleAnim, opacityAnim]);

  return (
    <Link href={href} style={styles.button} asChild>
      <Pressable>
        <Animated.View
          style={[
            styles.background,
            {
              backgroundColor: `${colors.secondaryAccent}50`,
              opacity: opacityAnim,
              transform: [{ scaleX: scaleAnim }],
            },
          ]}
        />
        <Ionicons
          name={icon}
          size={24}
          color={isActive ? colors.secondaryAccent : colors.neutralOpposite}
        />
        <Text style={[styles.title, { color: isActive ? colors.secondaryAccent : colors.neutralOpposite }]}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: 'medium',
  },
}); 