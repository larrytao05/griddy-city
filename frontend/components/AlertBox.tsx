import React, { useRef, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { getLineColor, getTextColor } from '@/constants/SubwayColors';
import { Ionicons } from '@expo/vector-icons';
import { truncateText } from '@/scripts/textUtils';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

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

const MAX_TITLE_LENGTH = 25;

export function AlertBox({
  type,
  title,
  description,
  timestamp,
  line,
  onPress,
  severity,
  affectedStations,
  startTime,
  endTime
}: AlertBoxProps) {
  const { colors } = useThemeContext();
  const lineColor = getLineColor(line);
  const textColor = getTextColor(lineColor);
  const [isExpanded, setIsExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    Animated.spring(expandAnim, {
      toValue: isExpanded ? 0 : 1,
      useNativeDriver: false,
      tension: 65,
      friction: 10,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    }).start();

    setIsExpanded(!isExpanded);
    onPress?.();
  };

  return (
    <View>
      <TouchableOpacity 
        style={[
          styles.alertCard,
          { backgroundColor: colors.neutralMid }
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
              {isExpanded ? title : truncateText(title, MAX_TITLE_LENGTH)}
            </Text>
            <View style={[styles.severityBadge, { backgroundColor: alertTypeColors[type] }]}>
              <Text style={styles.severityText}>{type}</Text>
            </View>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={[styles.alertDescription, { color: colors.neutralOpposite }]}>
              {description}
            </Text>
          </View>
          
          {isExpanded && (
            <View style={[styles.detailsContainer, { borderTopColor: colors.neutralOpposite }]}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.neutralOpposite }]}>Alert Type:</Text>
                <Text style={[styles.detailValue, { color: colors.neutralOpposite }]}>{type}</Text>
              </View>
              {severity && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.neutralOpposite }]}>Severity:</Text>
                  <Text style={[styles.detailValue, { color: colors.neutralOpposite }]}>{severity}</Text>
                </View>
              )}
              {startTime && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.neutralOpposite }]}>Start Time:</Text>
                  <Text style={[styles.detailValue, { color: colors.neutralOpposite }]}>{startTime}</Text>
                </View>
              )}
              {endTime && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.neutralOpposite }]}>End Time:</Text>
                  <Text style={[styles.detailValue, { color: colors.neutralOpposite }]}>{endTime}</Text>
                </View>
              )}
              {affectedStations && affectedStations.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.neutralOpposite }]}>Affected Stations:</Text>
                  <Text style={[styles.detailValue, { color: colors.neutralOpposite }]}>
                    {affectedStations.join(', ')}
                  </Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.neutralOpposite }]}>Line:</Text>
                <Text style={[styles.detailValue, { color: colors.neutralOpposite }]}>{line}</Text>
              </View>
            </View>
          )}
          
          <View style={styles.footer}>
            <Text style={[styles.timestamp, { color: colors.neutralOpposite, opacity: 0.7 }]}>
              {timestamp}
            </Text>
            <Animated.View style={{
              transform: [{
                rotate: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg']
                })
              }]
            }}>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.neutralOpposite}
              />
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  alertCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
  },
  alertType: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lineText: {
    fontWeight: 'bold',
    fontSize: 20,
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
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  descriptionContainer: {
    width: '80%',
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  severityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  alertDescription: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  contentContainer: {
    overflow: 'hidden',
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 8,
    opacity: 0.7,
    width: 100,
  },
  detailValue: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
  },
}); 