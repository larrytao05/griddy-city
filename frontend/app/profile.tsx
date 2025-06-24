import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';

// Test if supabase import works
let supabase: any;
try {
  const supabaseModule = require('@/lib/supabase');
  supabase = supabaseModule.supabase;
  console.log('Supabase import successful');
} catch (error) {
  console.error('Supabase import failed:', error);
}

export default function Profile() {
  const { colors } = useThemeContext();
  const { signOut } = useAuth();
  const router = useRouter();

  // Test Supabase connection
  useEffect(() => {
    console.log('Profile page loaded - testing Supabase connection...');
    if (supabase) {
      supabase.auth.getSession().then(({ data, error }: any) => {
        console.log('Supabase connection test:', data, error);
        if (error) {
          console.error('Supabase connection failed:', error);
        } else {
          console.log('Supabase connection successful!');
        }
      }).catch((err: any) => {
        console.error('Supabase test error:', err);
      });
    } else {
      console.error('Supabase not available');
    }
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/signin');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral }]}>
      {/* Logout Button */}
      <Pressable 
        style={[styles.logoutButton, { backgroundColor: colors.accent }]}
        onPress={handleLogout}
      >
        <Text style={[styles.logoutText, { color: '#FFFFFF' }]}>Log Out</Text>
      </Pressable>

      {/* Main Content */}
      <View style={styles.content}>
        <Ionicons 
          name="checkmark-circle" 
          size={120} 
          color={colors.accent} 
        />
        <Text style={[styles.text, { color: colors.neutralOpposite }]}>
          Successfully Signed In
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    zIndex: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    marginTop: 20,
    fontWeight: '500',
  },
}); 