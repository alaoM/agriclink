// app/(auth)/forgot-password.tsx
// Screen for requesting a password‑reset e‑mail.

import { AppText } from '@/components/AppText';
import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';

/* ─────────────────── Validation ─────────────────── */
const schema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid e‑mail'),
});

type FormData = yup.InferType<typeof schema>;

/* ─────────────────── API ─────────────────── */
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const ENDPOINT = `${API_BASE}/api/auth/forgot-password`;

async function requestReset(email: string) {
  return axios.post(ENDPOINT, { email });
}

/* ─────────────────── Screen ─────────────────── */
export default function ForgotPasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const onSubmit = async ({ email }: FormData) => {
    try {
      await requestReset(email.toLowerCase());
      Toast.show({
        type: 'success',
        text1: 'Reset link sent',
        text2: 'Check your inbox for instructions.',
      });
      router.replace(`/(auth)/reset-password?email=${encodeURIComponent(email)}`);
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Request failed',
        text2: e?.response?.data?.message || e.message || 'Unknown error',
      });
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
      >
        <View style={styles.centerBox}>
          <View style={styles.card}>
            {/* Header */}
            <TouchableOpacity
              accessibilityLabel="Back"
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Feather name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>

            <AppText style={styles.title}>Forgot Password</AppText>
            <AppText style={styles.subtitle}>
              Enter your registered e‑mail and we’ll send you a reset link.
            </AppText>

            {/* Email input */}
            <Controller
              control={control}
              name="email"
              defaultValue=""
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#6B8E6B"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[styles.input, errors.email && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && (
              <AppText style={styles.error}>{errors.email.message}</AppText>
            )}

            {/* Send button */}
            <TouchableOpacity
              style={[styles.primaryBtn, isSubmitting && styles.btnDisabled]}
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            >
              <AppText style={styles.btnText}>
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Brand */}
      <View style={styles.brandContainer}>
        <AppText style={styles.brand}>AgriConnect</AppText>
      </View>
    </SafeAreaView>
  );
}

/* ─────────────────── Styles ─────────────────── */
const PRIMARY = '#00A000';
const INPUT_BG = '#E6F3E6';
const BACKDROP = '#EAF8E5';
const CARD_RAD = 16;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKDROP },
  flex1: { flex: 1 },
  centerBox: { flexGrow: 1, justifyContent: 'center', padding: 16 },

  card: { backgroundColor: '#FFF', borderRadius: CARD_RAD, padding: 20 },

  backBtn: { marginBottom: 12, alignSelf: 'flex-start' },

  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 24 },

  input: {
    height: 48,
    backgroundColor: INPUT_BG,
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  inputError: { borderWidth: 1, borderColor: 'red' },
  error: { color: 'red', marginTop: -4, marginBottom: 8 },

  primaryBtn: {
    height: 48,
    backgroundColor: PRIMARY,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  brandContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brand: { fontSize: 16, fontWeight: '500', color: '#4C794C' },
});
