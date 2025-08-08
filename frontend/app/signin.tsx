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
        {/* Logo Group */}
        <View style={styles.logoGroup}>
          <SubwayLogo />
        </View>

        {/* Header and Inputs Group */}
        <View style={styles.formGroup}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.neutralOpposite }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.neutralSubtitle }]}>Sign in to your account</Text>
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
        </View>

        {/* Button and Footer Group */}
        <View style={styles.buttonFooterGroup}>
          <Pressable
            style={[
              styles.signInButton, 
              { 
                backgroundColor: isLoading ? '#6B7280' : colors.accent,
                opacity: isLoading ? 0.6 : 1
              }
            ]}
            onPress={handleSignIn}
            disabled={isLoading || !isFormComplete}
          >
            <Text style={[
              styles.signInText, 
              { 
                color: '#FFFFFF'
              }
            ]}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.neutralSubtitle }]}>
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={navigateToSignUp}>
              <Text style={[styles.linkText, { color: colors.secondaryAccent }]}>Sign Up</Text>
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
  signInButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
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
    fontWeight: '500'
  },
});
