import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SubwayLogo } from '@/components/SubwayLogo';

export default function SignUp() {
  const { colors } = useThemeContext();
  const { signUp, isLoading, error, clearError } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Clear error when user starts typing
  const handleNameChange = (text: string) => {
    setName(text);
    if (error) clearError();
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) clearError();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (error) clearError();
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (error) clearError();
  };

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const success = await signUp(email, password, name);
    if (success) {
      router.replace('/(tabs)/map');
    }
    // Error handling is now done in AuthContext
  };

  const navigateToSignIn = () => {
    router.push('/signin');
  };

  // Check if all fields are filled and passwords match
  const isFormComplete = name.trim() !== '' && 
                        email.trim() !== '' && 
                        password.trim() !== '' && 
                        confirmPassword.trim() !== '' && 
                        password === confirmPassword && 
                        password.length >= 6;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: colors.neutral }]}>
        {/* Logo Group */}
        <View style={styles.logoGroup}>
          <SubwayLogo />
        </View>

        {/* Header and Inputs Group */}
        <View style={styles.formGroup}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.neutralOpposite }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.neutralSubtitle }]}>Join us for better transit</Text>
          </View>

        <View style={styles.form}>
          {/* Error Message Display */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={[styles.errorText, { color: '#EF4444' }]}>{error.message}</Text>
            </View>
          )}

          <View style={[styles.inputContainer, { backgroundColor: '#0F4C75' }]}>
            <Ionicons name="person-outline" size={20} color={colors.lightAccent} />
            <TextInput
              style={[styles.input, { color: colors.neutralOpposite }]}
              placeholder="Full Name"
              placeholderTextColor={colors.neutralOpposite}
              value={name}
              onChangeText={handleNameChange}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.neutralMid, borderColor: `${colors.neutralOpposite}50` }]}>
            <Ionicons name="mail-outline" size={20} color={colors.neutralOpposite} />
            <TextInput
              style={[styles.input, { color: colors.neutralOpposite }]}
              placeholder="Email"
              placeholderTextColor={colors.neutralOpposite}
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.neutralMid, borderColor: `${colors.neutralOpposite}50` }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.neutralOpposite} />
            <TextInput
              style={[styles.input, { color: colors.neutralOpposite }]}
              placeholder="Password"
              placeholderTextColor={colors.neutralOpposite}
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.neutralMid, borderColor: `${colors.neutralOpposite}50` }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.neutralOpposite} />
            <TextInput
              style={[styles.input, { color: colors.neutralOpposite }]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.neutralOpposite}
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Button and Footer Group */}
        <View style={styles.buttonFooterGroup}>
          <Pressable
            style={[
              styles.signUpButton, 
              { 
                backgroundColor: isFormComplete && !isLoading ? colors.accent : '#6B7280',
                opacity: isFormComplete && !isLoading ? 1 : 0.6
              }
            ]}
            onPress={handleSignUp}
            disabled={isLoading || !isFormComplete}
          >
            <Text style={[
              styles.signUpText, 
              { 
                color: isFormComplete && !isLoading ? '#FFFFFF' : '#E5E7EB',
                fontWeight: isFormComplete && !isLoading ? 'bold' : 'normal'
              }
            ]}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.neutralSubtitle }]}>
            Already have an account?{' '}
          </Text>
          <Pressable onPress={navigateToSignIn} disabled={isLoading}>
            <Text style={[styles.linkText, { color: colors.accent }]}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 32,
    justifyContent: 'space-between'
  },
  logoGroup: {
    alignItems: 'center',
  },
  formGroup: {
    gap: 16,
  },
  buttonFooterGroup: {
    gap: 12,
    marginTop: 100
  },
  header: {
    alignItems: 'center',
    marginBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
    marginBottom: 30,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  signUpButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signUpText: {
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
    fontWeight: '500'
  },
});
