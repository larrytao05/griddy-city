import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

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
  const { user, signOut, isLoading } = useAuth();
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
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/signin');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get user metadata from Supabase session
  const [supabaseUser, setSupabaseUser] = useState<any>(null);

  useEffect(() => {
    const getSupabaseUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSupabaseUser(session.user);
        }
      } catch (error) {
        console.error('Error getting Supabase user:', error);
      }
    };

    getSupabaseUser();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.accent }]}>
        <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Profile</Text>
        <Pressable 
          style={[styles.logoutButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={[styles.logoutText, { color: '#FFFFFF' }]}>
            {isLoading ? 'Signing Out...' : 'Log Out'}
          </Text>
        </Pressable>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={[styles.card, { backgroundColor: colors.neutralMid }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.accent }]}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          
          <Text style={[styles.userName, { color: colors.neutralOpposite }]}>
            {supabaseUser?.user_metadata?.name || user?.name || 'User'}
          </Text>
          
          <Text style={[styles.userEmail, { color: colors.neutralSubtitle }]}>
            {user?.email || 'No email available'}
          </Text>
        </View>

        {/* Account Details */}
        <View style={[styles.card, { backgroundColor: colors.neutralMid }]}>
          <Text style={[styles.sectionTitle, { color: colors.neutralOpposite }]}>Account Details</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={20} color={colors.accent} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.neutralSubtitle }]}>Email</Text>
              <Text style={[styles.detailValue, { color: colors.neutralOpposite }]}>
                {user?.email || 'Not available'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.accent} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.neutralSubtitle }]}>Member Since</Text>
              <Text style={[styles.detailValue, { color: colors.neutralOpposite }]}>
                {supabaseUser?.created_at ? formatDate(supabaseUser.created_at) : 'Not available'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={colors.accent} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.neutralSubtitle }]}>Last Sign In</Text>
              <Text style={[styles.detailValue, { color: colors.neutralOpposite }]}>
                {supabaseUser?.last_sign_in_at ? formatDate(supabaseUser.last_sign_in_at) : 'Not available'}
              </Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={[styles.card, { backgroundColor: colors.neutralMid }]}>
          <Text style={[styles.sectionTitle, { color: colors.neutralOpposite }]}>App Information</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="train-outline" size={20} color={colors.accent} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.neutralSubtitle }]}>App Name</Text>
              <Text style={[styles.detailValue, { color: colors.neutralOpposite }]}>Griddy City</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.neutralSubtitle }]}>Version</Text>
              <Text style={[styles.detailValue, { color: colors.neutralOpposite }]}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Success Message */}
        <View style={[styles.successCard, { backgroundColor: '#D1FAE5', borderColor: '#10B981' }]}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <Text style={[styles.successText, { color: '#065F46' }]}>
            Successfully signed in with Supabase!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 20,
  },
  successText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
}); 