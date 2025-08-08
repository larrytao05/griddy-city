import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SubwayLogo } from '@/components/SubwayLogo';

export default function SignUp() {
  const { colors } = useThemeContext();
  const { signUp } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      const success = await signUp(email, password, name);
      if (success) {
        router.replace('/(tabs)/map');
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

          <View style={[styles.inputContainer, { backgroundColor: colors.neutralMid, borderColor: `${colors.neutralOpposite}50` }]}>
            <Ionicons name="person-outline" size={20} color={colors.neutralOpposite} />
            <TextInput
              style={[styles.input, { color: colors.neutralOpposite }]}
              placeholder="Full Name"
              placeholderTextColor={colors.neutralOpposite}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.neutralMid, borderColor: `${colors.neutralOpposite}50` }]}>
            <Ionicons name="mail-outline" size={20} color={colors.neutralOpposite} />
            <TextInput
              style={[styles.input, { color: colors.neutralOpposite }]}
              placeholder="Email"
              placeholderTextColor={colors.neutralOpposite}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.neutralMid, borderColor: `${colors.neutralOpposite}50` }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.neutralOpposite} />
            <TextInput
              style={[styles.input, { color: colors.neutralOpposite }]}
              placeholder="Password"
              placeholderTextColor={colors.neutralOpposite}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.neutralMid, borderColor: `${colors.neutralOpposite}50` }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.neutralOpposite} />
            <TextInput
              style={[styles.input, { color: colors.neutralOpposite }]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.neutralOpposite}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Button and Footer Group */}
        <View style={styles.buttonFooterGroup}>
          <Pressable
            style={[
              styles.signUpButton, 
              { 
                backgroundColor: isLoading ? '#6B7280' : colors.accent,
                opacity: isLoading ? 0.6 : 1
              }
            ]}
            onPress={handleSignUp}
            disabled={isLoading || !isFormComplete}
          >
            <Text style={[
              styles.signUpText, 
              { 
                color: '#FFFFFF'
              }
            ]}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.neutralSubtitle }]}>
              Already have an account?{' '}
            </Text>
            <Pressable onPress={navigateToSignIn}>
              <Text style={[styles.linkText, { color: colors.secondaryAccent }]}>Sign In</Text>
            </Pressable>
          </View>
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
