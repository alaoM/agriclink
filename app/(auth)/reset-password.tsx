// app/(auth)/reset-password.tsx
import { Feather, Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as yup from 'yup';

/* ─────────────────── Validation ─────────────────── */
const schema = yup.object().shape({
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Min 8 characters')
    .matches(/[a-z]/, 'Need a lowercase letter')
    .matches(/[A-Z]/, 'Need an uppercase letter')
    .matches(/\d/,  'Need a number'),
  confirmPassword: yup
    .string()
    .required('Confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

type FormData = yup.InferType<typeof schema>;

/* ─────────────────── Screen ─────────────────── */
export default function ResetPasswordScreen() {
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await fakeReset(data.newPassword);   // TODO replace with real API
      router.replace('/(auth)/login');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong');
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
      >
        <View style={styles.centerBox}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.headerRow}>
              <Feather name="arrow-left" size={24} onPress={() => router.back()} />
              <Ionicons name="help-circle-outline" size={24} />
            </View>

            {/* Title / subtitle */}
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password and confirm it below.
            </Text>

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
                    style={[
                      styles.input,
                      errors.newPassword && styles.inputError,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <Feather
                name={showNew ? 'eye-off' : 'eye'}
                size={20}
                onPress={() => setShowNew((v) => !v)}
              />
            </View>
            {errors.newPassword && (
              <Text style={styles.error}>{errors.newPassword.message}</Text>
            )}

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
                    style={[
                      styles.input,
                      errors.confirmPassword && styles.inputError,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <Feather
                name={showConfirm ? 'eye-off' : 'eye'}
                size={20}
                onPress={() => setShowConfirm((v) => !v)}
              />
            </View>
            {errors.confirmPassword && (
              <Text style={styles.error}>{errors.confirmPassword.message}</Text>
            )}

            {/* Reset button */}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                isSubmitting && styles.btnDisabled,
              ]}
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.btnText}>
                {isSubmitting ? 'Resetting…' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Brand pinned bottom */}
      <View style={styles.brandContainer}>
        <Text style={styles.brand}>AgriConnect</Text>
      </View>
    </SafeAreaView>
  );
}

/* ─────────────────── Fake API ─────────────────── */
async function fakeReset(pw: string) {
  return new Promise((res) => setTimeout(res, 1500));
}

/* ─────────────────── Styles ─────────────────── */
const PRIMARY   = '#00A000';
const INPUT_BG  = '#E6F3E6';
const BACKDROP  = '#EAF8E5';
const CARD_RAD  = 16;

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: BACKDROP },
  flex1:        { flex: 1 },
  centerBox:    { flex: 1, justifyContent: 'center', padding: 16 },

  card:         { backgroundColor: '#FFF', borderRadius: CARD_RAD, padding: 20 },

  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },

  title:        { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle:     { fontSize: 14, color: '#555', marginBottom: 24 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 6,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 48,
  },
  input:        { flex: 1, fontSize: 16 },
  inputError:   { borderWidth: 1, borderColor: 'red' },
  error:        { color: 'red', marginTop: -8, marginBottom: 8 },

  primaryBtn: {
    height: 48,
    backgroundColor: PRIMARY,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled:  { opacity: 0.6 },
  btnText:      { color: '#FFF', fontSize: 16, fontWeight: '600' },

  brandContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brand:        { fontSize: 16, fontWeight: '500', color: '#4C794C' },
});
