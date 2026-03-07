import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: These client IDs come from Google Cloud Console → APIs & Services
// → Credentials.  Copy the "Android" client ID for androidClientId and the
// "Web client (auto created by Google Service)" for webClientId.
// Example shape: 246566415924-xxxxxxxxxxxx.apps.googleusercontent.com
// ─────────────────────────────────────────────────────────────────────────────
// Found from the error URL — the real auto-created web client
const GOOGLE_WEB_CLIENT_ID = 'project-246566415924.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '73367343109-33hubgns7s1m6bad5akhfj2bdcbskbgh.apps.googleusercontent.com';
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest(
  {
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  },
  { useProxy: true }
);
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (!id_token) {
        setError('Google did not return a token. Check your client IDs.');
        return;
      }
      setGoogleLoading(true);
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => router.replace('/(tabs)'))
        .catch((err: any) => setError(err.message || 'Google sign-in failed'))
        .finally(() => setGoogleLoading(false));
    } else if (response?.type === 'error') {
      setError('Google sign-in failed: ' + (response.error?.message ?? 'unknown error'));
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🌿</Text>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to focus better</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Google Sign-In */}
          <TouchableOpacity
            style={[styles.googleButton, !request && styles.buttonDisabled]}
            onPress={() => promptAsync({ useProxy: true })}
            disabled={googleLoading || !request}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator color="#5C6B73" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="johndoe@example.com"
              placeholderTextColor="#A0ABC0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#A0ABC0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Sign In */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCF8',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F0EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#354F52',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#5C6B73',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F3E46',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE7DE',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2F3E46',
    elevation: 2,
  },
  button: {
    backgroundColor: '#52796F',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#52796F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EBE7DE',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 12,
    elevation: 3,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F3E46',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBE7DE',
  },
  dividerText: {
    fontSize: 13,
    color: '#A0ABC0',
    fontWeight: '500',
  },
  errorText: {
    color: '#E29578',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});
