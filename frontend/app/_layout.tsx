import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { LocationProvider } from '@/context/LocationContext';
import { View, StyleSheet } from 'react-native';

function RootLayoutNav() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen 
        name="search"
        options={{
          animation: 'none',
          headerShown: false
        }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LocationProvider>
        <RootLayoutNav />
      </LocationProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
