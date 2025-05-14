import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';
import { useAuthStore } from '@/store/auth-store.ts';
import { useColorScheme } from '@/hooks/useColorScheme.ts';
import { useGoogleAuth } from '@/utils/google-auth.ts';
import { router } from 'expo-router';

export default function GoogleSignInButton() {
  const { loginWithGoogle } = useAuthStore();
  const { colors } = useColorScheme();
  const { signInWithGoogle, loading } = useGoogleAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      await loginWithGoogle();
      router.replace('/');
    } catch (error) {
      console.error('Google sign in failed:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: '#ffffff', borderColor: colors.border }
      ]}
      onPress={handleGoogleSignIn}
      disabled={loading}
    >
      <View style={styles.buttonContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.googleIcon}>G</Text>
        </View>
        <Text style={styles.buttonText}>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  googleIcon: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
});