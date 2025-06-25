import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export default function Index() {
  const { user, isLoading } = useAuth();
  const { colors } = useThemeContext();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.neutral }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Redirect based on authentication status
  if (user) {
    return <Redirect href="/(tabs)/map" />;
  } else {
    return <Redirect href="/signin" />;
  }
} 