import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SubwayLogo } from '@/components/SubwayLogo';

export default function SignIn() {
  const { colors } = useThemeContext();
  const { signIn } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const success = await signIn(email, password);
      if (success) {
        router.replace('/(tabs)/map');
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignUp = () => {
    router.push('/signup');
  };

  // Check if all fields are filled
  const isFormComplete = email.trim() !== '' && password.trim() !== '';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: colors.neutral }]}>
        <View style={styles.header}>
          <SubwayLogo />
          <Ionicons name="train" size={60} color={colors.accent} style={styles.trainIcon} />
          <Text style={[styles.title, { color: colors.neutralOpposite }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.neutralSubtitle }]}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: '#0F4C75' }]}>
            <Ionicons name="mail-outline" size={20} color={colors.lightAccent} />
            <TextInput
              style={[styles.input, { color: '#FFFFFF' }]}
              placeholder="Email"
              placeholderTextColor={colors.lightAccent}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: '#0F4C75' }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.lightAccent} />
            <TextInput
              style={[styles.input, { color: '#FFFFFF' }]}
              placeholder="Password"
              placeholderTextColor={colors.lightAccent}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Pressable
            style={[
              styles.signInButton, 
              { 
                backgroundColor: isFormComplete ? colors.accent : '#6B7280',
                opacity: isFormComplete ? 1 : 0.6
              }
            ]}
            onPress={handleSignIn}
            disabled={isLoading || !isFormComplete}
          >
            <Text style={[
              styles.signInText, 
              { 
                color: isFormComplete ? '#FFFFFF' : '#E5E7EB',
                fontWeight: isFormComplete ? 'bold' : 'normal'
              }
            ]}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.neutralSubtitle }]}>
            Don't have an account?{' '}
          </Text>
          <Pressable onPress={navigateToSignUp}>
            <Text style={[styles.linkText, { color: colors.accent }]}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  signInButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  signInText: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
  },
  trainIcon: {
    marginBottom: 20,
  },
});
