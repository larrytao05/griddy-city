import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { AlertBox, AlertType } from '@/components/AlertBox';

// This interface will match the MTA API response structure
interface MTAAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  timestamp: string;
  line: string;
  read: boolean;
  affectedStations?: string[];
  startTime?: string;
  endTime?: string;
  severity?: 'minor' | 'moderate' | 'severe';
}

// Temporary mock data - will be replaced with API call
const mockAlerts: MTAAlert[] = [
  {
    id: '1',
    type: 'delay',
    title: 'Signal Problems on 1 Line',
    description: 'Trains are running with delays between 96th St and 59th St due to signal problems.',
    timestamp: '10 minutes ago',
    line: '1',
    read: false,
    severity: 'moderate'
  },
  {
    id: '2',
    type: 'detour',
    title: 'Track Work on A Line',
    description: 'A trains are running on the F line between Jay St and W 4th St due to track maintenance.',
    timestamp: '1 hour ago',
    line: 'A',
    read: false,
    severity: 'minor'
  },
  {
    id: '3',
    type: 'service',
    title: 'Weekend Service Changes',
    description: 'No 4 train service between 125th St and Grand Central this weekend.',
    timestamp: '2 hours ago',
    line: '4',
    read: false,
    severity: 'severe'
  }
];

export default function Alerts() {
  const { colors } = useThemeContext();
  const [alerts, setAlerts] = useState<MTAAlert[]>(mockAlerts);
  const [refreshing, setRefreshing] = useState(false);

  // This function will be replaced with actual API call
  const fetchAlerts = async () => {
    // TODO: Implement MTA API call
    // const response = await fetch('YOUR_MTA_API_ENDPOINT');
    // const data = await response.json();
    // setAlerts(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral }]}>
      <Text style={[styles.header, { color: colors.neutralOpposite }]}>Service Alerts</Text>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.neutralOpposite]}
            tintColor={colors.neutralOpposite}
          />
        }
      >
        {alerts.map(alert => (
          <AlertBox
            key={alert.id}
            {...alert}
            onPress={() => markAsRead(alert.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 60,
  },
  scrollView: {
    flex: 1,
  },
}); 