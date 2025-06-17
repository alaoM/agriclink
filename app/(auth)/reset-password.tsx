// app/(auth)/reset-password.tsx
// Allows a user to reset their password by submitting username/email + OTP + new password.

import { AppText } from '@/components/AppText';
import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
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
  otp: yup
    .string()
    .required('OTP is required')
    .matches(/^[0-9]{6}$/,'OTP must be 6 digits'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Min 8 characters')
    .matches(/[a-z]/, 'Need a lowercase letter')
    .matches(/[A-Z]/, 'Need an uppercase letter')
    .matches(/\d/, 'Need a number')
    .matches(/[^a-zA-Z0-9]/, 'Include a special character'),
  confirmPassword: yup
    .string()
    .required('Confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

type FormData = yup.InferType<typeof schema>;

/* ─────────────────── API ─────────────────── */
const API_BASE = process.env.API_BASE;
const ENDPOINT = `${API_BASE}/api/auth/reset-password`;

async function resetPassword(identifier: string, otp: string, newPassword: string) {
  // Some back‑ends want "username" even if you pass an e‑mail.
  const payload = {
    email: identifier, // alias for email/username
    otp,
    newPassword,
  } as const;


  console.log('Payload:', payload);

 
  return axios.post(ENDPOINT, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
}

/* ─────────────────── Screen ─────────────────── */
export default function ResetPasswordScreen() {
  /** email or username arrives via query param */
  const { email, username } = useLocalSearchParams<{ email?: string; username?: string }>();
  const identifier = email ?? username;

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const onSubmit = async ({ otp, newPassword }: FormData) => {
    if (!identifier) {
      Toast.show({ type: 'error', text1: 'Missing account identifier' });
      return;
    }
    try {
      await resetPassword(identifier, otp, newPassword);
      Toast.show({ type: 'success', text1: 'Password reset!' });
      router.replace('/(auth)/login');
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Reset failed',
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
            {/* Back */}
            <TouchableOpacity accessibilityLabel="Back" onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>

            <AppText style={styles.title}>Reset Password</AppText>
            <AppText style={styles.subtitle}>
              Enter the 6‑digit OTP we sent and your new password.
            </AppText>

            {/* OTP */}
            <Controller
              control={control}
              name="otp"
              defaultValue=""
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="OTP (6 digits)"
                  placeholderTextColor="#6B8E6B"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={[styles.input, errors.otp && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.otp && <AppText style={styles.error}>{errors.otp.message}</AppText>}

            {/* New password */}
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="newPassword"
                defaultValue=""
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="New Password"
                    placeholderTextColor="#6B8E6B"
                    secureTextEntry={!showNew}
                    style={[styles.innerInput, errors.newPassword && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <Feather name={showNew ? 'eye-off' : 'eye'} size={20} onPress={() => setShowNew((v) => !v)} />
            </View>
            {errors.newPassword && <AppText style={styles.error}>{errors.newPassword.message}</AppText>}

            {/* Confirm password */}
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="confirmPassword"
                defaultValue=""
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Confirm New Password"
                    placeholderTextColor="#6B8E6B"
                    secureTextEntry={!showConfirm}
                    style={[styles.innerInput, errors.confirmPassword && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <Feather name={showConfirm ? 'eye-off' : 'eye'} size={20} onPress={() => setShowConfirm((v) => !v)} />
            </View>
            {errors.confirmPassword && <AppText style={styles.error}>{errors.confirmPassword.message}</AppText>}

            {/* Reset button */}
            <TouchableOpacity
              style={[styles.primaryBtn, isSubmitting && styles.btnDisabled]}
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            >
              <AppText style={styles.btnText}>{isSubmitting ? 'Resetting…' : 'Reset Password'}</AppText>
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
  centerBox: { flex: 1, justifyContent: 'center', padding: 16 },

  card: { backgroundColor: '#FFF', borderRadius: CARD_RAD, padding: 20 },
  backBtn: { marginBottom: 12, alignSelf: 'flex-start' },

  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 24 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 6,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 48,
  },
  innerInput: { flex: 1, fontSize: 16 },

  input: {
    height: 48,
    backgroundColor: INPUT_BG,
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  inputError: { borderWidth: 1, borderColor: 'red' },
  error: { color: 'red', marginTop: -8, marginBottom: 8 },

  primaryBtn: {
    height: 48,
    backgroundColor: PRIMARY,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
