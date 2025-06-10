import React, { useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { getLineColor, getTextColor } from '@/utils/subwayColors';

export type AlertType = 'delay' | 'detour' | 'service' | 'planned' | 'emergency';

export interface AlertBoxProps {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  timestamp: string;
  line: string;
  read: boolean;
  onPress?: () => void;
  // Additional MTA-specific fields that might come from the API
  affectedStations?: string[];
  startTime?: string;
  endTime?: string;
  severity?: 'minor' | 'moderate' | 'severe';
}

// Alert type colors - can be expanded based on MTA's alert types
const alertTypeColors: Record<AlertType, string> = {
  delay: '#FFA500',    // Orange
  detour: '#FF0000',   // Red
  service: '#0000FF',  // Blue
  planned: '#008000',  // Green
  emergency: '#FF0000' // Red
};

export function AlertBox({
  type,
  title,
  description,
  timestamp,
  line,
  onPress,
  severity
}: AlertBoxProps) {
  const { colors } = useThemeContext();
  const lineColor = getLineColor(line);
  const textColor = getTextColor(lineColor);
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Animate opacity to 0.5 and back
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.5,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();

    // Call the original onPress handler
    onPress?.();
  };

  return (
    <Animated.View style={{ opacity }}>
      <TouchableOpacity 
        style={[
          styles.alertCard,
          { backgroundColor: colors.neutral === '#121212' ? 'rgba(111, 103, 102, 0.46)' : 'rgba(205, 211, 205, 0.97)' }
        ]}
        onPress={handlePress}
        activeOpacity={1}
      >
        <View style={[styles.alertType, { backgroundColor: lineColor }]}>
          <Text style={[styles.lineText, { color: textColor }]}>{line}</Text>
        </View>
        <View style={styles.alertContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.alertTitle, { color: colors.neutralOpposite }]}>
              {title}
            </Text>
            {severity && (
              <View style={[styles.severityBadge, { backgroundColor: alertTypeColors[type] }]}>
                <Text style={styles.severityText}>{severity}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.alertDescription, { color: colors.neutralOpposite }]}>
            {description}
          </Text>
          <Text style={[styles.timestamp, { color: colors.neutralOpposite, opacity: 0.7 }]}>
            {timestamp}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  alertCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertType: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lineText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  alertContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  alertDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
}); 