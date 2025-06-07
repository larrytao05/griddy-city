import { Tabs } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';
import { TabBar } from '@/components/TabBar';

export default function TabLayout() {
  const { colors } = useThemeContext();

  return (
    <Tabs
      initialRouteName="map"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none', // Hide default tab bar since we're using our custom one
        },
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarLabel: 'Map',
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: 'Routes',
          tabBarLabel: 'Routes',
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarLabel: 'Alerts',
        }}
      />
    </Tabs>
  );
}
