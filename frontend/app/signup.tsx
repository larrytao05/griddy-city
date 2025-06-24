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
        <View style={styles.header}>
          <SubwayLogo />
          <Ionicons name="train" size={60} color={colors.accent} style={styles.trainIcon} />
          <Text style={[styles.title, { color: colors.neutralOpposite }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.neutralSubtitle }]}>Join us for better transit</Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: '#0F4C75' }]}>
            <Ionicons name="person-outline" size={20} color={colors.lightAccent} />
            <TextInput
              style={[styles.input, { color: '#FFFFFF' }]}
              placeholder="Full Name"
              placeholderTextColor={colors.lightAccent}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

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

          <View style={[styles.inputContainer, { backgroundColor: '#0F4C75' }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.lightAccent} />
            <TextInput
              style={[styles.input, { color: '#FFFFFF' }]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.lightAccent}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Pressable
            style={[
              styles.signUpButton, 
              { 
                backgroundColor: isFormComplete ? colors.accent : '#6B7280',
                opacity: isFormComplete ? 1 : 0.6
              }
            ]}
            onPress={handleSignUp}
            disabled={isLoading || !isFormComplete}
          >
            <Text style={[
              styles.signUpText, 
              { 
                color: isFormComplete ? '#FFFFFF' : '#E5E7EB',
                fontWeight: isFormComplete ? 'bold' : 'normal'
              }
            ]}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.neutralSubtitle }]}>
            Already have an account?{' '}
          </Text>
          <Pressable onPress={navigateToSignIn}>
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
  signUpButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
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
    fontWeight: '600',
  },
  trainIcon: {
    marginBottom: 20,
  },
});
