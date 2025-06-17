// app/(auth)/register.tsx
import { AppText } from '@/components/AppText';
import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import axios, { AxiosResponse } from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Controller,
  useForm
} from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';

/* ─────────────────── Validation ─────────────────── */
const schema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'Too short'),
  lastName: yup.string().required('Last name is required').min(2, 'Too short'),
  email: yup.string().required('Email is required').email('Invalid email'),
  mobileNo: yup.string()
    .required('Mobile number is required')
    .matches(/^[0-9]{7,15}$/, 'Invalid phone'),
  address: yup.string().required('Address is required').min(5, 'Too short'),
  idNo: yup.string()
    .required('ID number is required')
    .matches(/^[0-9]+$/, 'ID number must be numeric'),
  username: yup.string()
    .required('Username is required')
    .matches(/^[a-zA-Z0-9_]{3,25}$/, '3‑25 letters, digits or _'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Min 8 characters')
    .matches(/[a-z]/, 'Need a lowercase letter')
    .matches(/[A-Z]/, 'Need an uppercase letter')
    .matches(/\d/, 'Need a number')
    .matches(/[^a-zA-Z0-9]/, 'Include a special character'),
});

type FormData = yup.InferType<typeof schema>;

/* ─────────────────── API ─────────────────── */
const API_BASE = process.env.API_BASE;
export async function registerUser<T = unknown>(
  payload: Record<string, unknown>,
): Promise<AxiosResponse<T>> {
  return axios.post(`${API_BASE}/api/auth/register`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/* ─────────────────── Register Screen ─────────────────── */
export default function RegisterScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: yupResolver(schema) });
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      username: data.username,
      password: data.password,
      mobileNo: data.mobileNo,
      idNo: data.idNo,
      address: data.address,
    };

    try {
      const resp = await registerUser(payload);
      const message = resp.data?.message || 'Registration successful';

      Toast.show({
        type: 'success',
        text1: 'Registration successful',
        text2: message,
      });

      router.push({
        pathname: '/(auth)/verify-otp',
        params: {
          api: `${API_BASE}/api/auth/verify-otp`,
          purpose: 'email',
          email: data.email,
          next: '/login',
        },
      });
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration failed',
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
        <ScrollView
          contentContainerStyle={styles.centerBox}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.headerRow}>

              <Feather name="arrow-left" size={24} onPress={() => router.back()} />
              <AppText style={styles.headerTitle}>Register</AppText>
              <View style={{ width: 24 }} />
            </View>

            {/* Inputs */}
            {inputSpec.map(({ name, label, secure }) => (
              <View key={name} style={styles.inputGroup}>
                <AppText style={styles.label}>{label}</AppText>
                <Controller
                  control={control}
                  name={name as keyof FormData}
                  defaultValue=""
                  render={({ field: { onBlur, onChange, value } }) => (
                    <View style={styles.passwordContainer}>
                      <TextInput
                        placeholder={`Enter your ${label.toLowerCase()}`}
                        placeholderTextColor="#6B8E6B"
                        secureTextEntry={secure && !showPassword}
                        style={[
                          styles.input,
                          secure && styles.passwordInput,
                          errors[name as keyof FormData] && styles.inputError,
                        ]}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                      {secure && (
                        <TouchableOpacity
                          onPress={() => setShowPassword(v => !v)}
                          style={styles.eyeIcon}
                        >
                          <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
                        </TouchableOpacity>
                      )}
                    </View>

                  )}
                />
                {errors[name as keyof FormData] && (
                  <AppText style={styles.error}>
                    {errors[name as keyof FormData]?.message as string}
                  </AppText>
                )}
              </View>
            ))}

            {/* Register button */}
            <TouchableOpacity
              style={[styles.primaryBtn, isSubmitting && styles.btnDisabled]}
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            >
              <AppText style={styles.btnText}>
                {isSubmitting ? 'Creating account…' : 'Register'}
              </AppText>
            </TouchableOpacity>

            {/* Sign in link */}
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <AppText style={styles.link}>
                Already have an account? <AppText style={{ fontWeight: '600' }}>Sign in</AppText>
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Brand logo */}
      <View style={styles.brandContainer}>
        <AppText style={styles.brand}>AgriConnect</AppText>
      </View>
    </SafeAreaView>
  );
}

/* Inputs used for form generation */
const inputSpec = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'email', label: 'Email' },
  { name: 'mobileNo', label: 'Mobile Number' },
  { name: 'address', label: 'Address' },
  { name: 'idNo', label: 'ID Number' },
  { name: 'username', label: 'Username' },
  { name: 'password', label: 'Password', secure: true },
] as const;

/* ─────────────────── Styles ─────────────────── */
const PRIMARY = '#00A000';
const INPUT_BG = '#E6F3E6';
const BACKDROP = '#EAF8E5';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKDROP },
  flex1: { flex: 1 },
  centerBox: { flexGrow: 1, justifyContent: 'center', padding: 16 },

  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '600' },

  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 4, color: '#222' },
  input: {
    height: 48,
    backgroundColor: INPUT_BG,
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  inputError: { borderWidth: 1, borderColor: 'red' },
  error: { color: 'red', marginTop: 2 },
  eyeIcon: { position: 'absolute', right: 12, top: 14 },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 40 },

  primaryBtn: {
    height: 48,
    backgroundColor: PRIMARY,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  link: { color: PRIMARY, textAlign: 'center', textDecorationLine: 'underline' },
  brandContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brand: { fontSize: 16, fontWeight: '500', color: '#4C794C' },
});
