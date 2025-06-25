// screens/login.tsx

import { AppText } from '@/components/AppText';
import LoginTFA from '@/components/LoginTFA';
import { useAuth } from '@/contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import Checkbox from 'expo-checkbox';
import { router } from 'expo-router';
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

/* ─────────────── Validation ─────────────── */
const schema = yup.object({
  identifier: yup
    .string()
    .required('Username or email is required')
    .test('valid-id', 'Invalid username or email', (v = '') => {
      const usernameRegex = /^[a-zA-Z0-9_]{3,25}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return usernameRegex.test(v) || emailRegex.test(v);
    }),
  password: yup.string().required('Password is required').min(8, 'Min 8 characters'),
});

type FormData = yup.InferType<typeof schema>;

/* ─────────────── API ─────────────── */
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const LOGIN_ENDPOINT = `${API_BASE}/api/auth/login`;

const loginRequest = (username: string, password: string, keepSignedIn: boolean) =>
  axios.post(LOGIN_ENDPOINT, { username, password, keepSignedIn });

/* ─────────────── Component ─────────────── */
export default function LoginScreen() {
  const { signIn } = useAuth();
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTFA, setShowTFA] = useState(false);
  const [method, setMethod] = useState<'email' | 'authenticator' | null>(null);
  const [authDetails, setAuthDetails] = useState<{ email: string; password: string } | null>(null);
 
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const onSubmit = async ({ identifier, password }: FormData) => {
    try {
      const response = await loginRequest(identifier, password, keepSignedIn);
      console.log(response.data)
      const { token, user, twoFactorEnabled, twoFactorMethod } = response.data;

      if (twoFactorEnabled) {
        setShowTFA(true);
        setMethod(twoFactorMethod);
        setAuthDetails({ email: identifier, password });
      } else {
        await signIn({ token, user, remember: keepSignedIn });
        Toast.show({ type: 'success', text1: 'Welcome back!' });
      // router.replace("/(main)")
      }
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: e?.response?.data?.message || e.message || 'Unknown error',
      });
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.centerBox}>
          <View style={styles.card}>
            <AppText style={styles.title}>Welcome back</AppText>

            {/* Identifier */}
            <Controller
              control={control}
              name="identifier"
              defaultValue=""
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Username or Email"
                  placeholderTextColor="#6B8E6B"
                  autoCapitalize="none"
                  style={[styles.input, errors.identifier && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.identifier && <AppText style={styles.error}>{errors.identifier.message}</AppText>}

            {/* Password */}
            <Controller
              control={control}
              name="password"
              defaultValue=""
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#6B8E6B"
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.eyeIcon}>
                    <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <AppText style={styles.error}>{errors.password.message}</AppText>}

            {/* Keep signed in */}
            <View style={styles.row}>
              <Checkbox value={keepSignedIn} onValueChange={setKeepSignedIn} color={keepSignedIn ? PRIMARY : undefined} />
              <AppText style={styles.keepText}>Keep me signed in</AppText>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.primaryBtn, isSubmitting && styles.btnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <AppText style={styles.btnText}>{isSubmitting ? 'Logging in…' : 'Log In'}</AppText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <AppText style={styles.link}>Forgot Password?</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.brandContainer}>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <AppText style={styles.accountLink} >Create new account</AppText>
        </TouchableOpacity>
        <AppText style={styles.brand}>AgricLink</AppText>
      </View>

      {/* 2FA Modal */}
     
   {showTFA && (
  <LoginTFA
    visible={showTFA}
    onClose={() => setShowTFA(false)}
    method={method}
    email={authDetails?.email ?? ''}
    password={authDetails?.password ?? ''}
  />
)}

    </SafeAreaView>
  );
}

/* ─────────────── Styles ─────────────── */
const PRIMARY = '#00A000';
const INPUT_BG = '#E6F3E6';
const BACKDROP = '#EAF8E5';
const CARD_RAD = 16;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKDROP },
  flex1: { flex: 1 },
  centerBox: { flex: 1, justifyContent: 'center', padding: 16 },

  card: { backgroundColor: '#FFF', borderRadius: CARD_RAD, padding: 20 },

  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  input: {
    color: '#000',
    height: 48,
    backgroundColor: INPUT_BG,
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  inputError: { borderColor: 'red', borderWidth: 1 },
  error: { color: 'red', marginBottom: 6 },

  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 40 },
  eyeIcon: { position: 'absolute', right: 12, top: 14 },

  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  keepText: { fontSize: 14, color: '#222', marginLeft:5 },

  primaryBtn: {
    height: 48,
    backgroundColor: PRIMARY,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  brandContainer: { alignItems: 'center', position: 'absolute', bottom: 20, left: 0, right: 0 },
  brand: { fontSize: 16, fontWeight: '500', color: '#4C794C' },
  accountLink: { color: PRIMARY, textAlign: 'center', fontWeight: '600', textDecorationLine: 'underline', marginBottom: 12 },
  link: { color: PRIMARY, textAlign: 'center', textDecorationLine: 'underline' },
});
