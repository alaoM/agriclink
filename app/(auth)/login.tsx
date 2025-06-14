// app/(auth)/login.tsx
import { AppText } from '@/components/AppText';
import { yupResolver } from '@hookform/resolvers/yup';
import Checkbox from 'expo-checkbox';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as yup from 'yup';

/* ─────────────────── Validation (unchanged) ─────────────────── */
const schema = yup.object().shape({
  identifier: yup
    .string()
    .required('Username or email is required')
    .test('is-valid', 'Enter a valid username or email', (v = '') => {
      const userRx = /^[a-zA-Z0-9_]{3,25}$/;
      const mailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return userRx.test(v) || mailRx.test(v);
    }),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain a lowercase letter')
    .matches(/[A-Z]/, 'Password must contain an uppercase letter')
    .matches(/\d/,  'Password must contain a number'),
});

type FormData = { identifier: string; password: string };

/* ───────────────────────── Screen ───────────────────────── */
export default function Login() {
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await fakeLogin(data.identifier, data.password); // TODO replace
      router.replace('/(main)');
    } catch (err: any) {
      Alert.alert('Login failed', err.message || 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Card & form centred in available space */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
      >
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
                  placeholder="Username"
                  placeholderTextColor="#6B8E6B"
                  style={[
                    styles.input,
                    errors.identifier && styles.inputError,
                  ]}
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  returnKeyType="next"
                />
              )}
            />
            {errors.identifier && (
              <AppText style={styles.error}>{errors.identifier.message}</AppText>
            )}

            {/* Password */}
            <Controller
              control={control}
              name="password"
              defaultValue=""
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#6B8E6B"
                  style={[
                    styles.input,
                    errors.password && styles.inputError,
                  ]}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  returnKeyType="done"
                />
              )}
            />
            {errors.password && (
              <AppText style={styles.error}>{errors.password.message}</AppText>
            )}

            {/* Keep me signed in */}
            <View style={styles.row}>
              <Checkbox
                value={keepSignedIn}
                onValueChange={setKeepSignedIn}
                color={keepSignedIn ? PRIMARY : undefined}
                style={styles.checkbox}
              />
              <AppText style={styles.keepText}>Keep me signed in</AppText>
            </View>

            {/* Log In */}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                isSubmitting && styles.btnDisabled,
              ]}
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            >
              <AppText style={styles.btnText}>
                {isSubmitting ? 'Logging in…' : 'Log In'}
              </AppText>
            </TouchableOpacity>

            {/* Forgot password */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <AppText style={styles.link}>Forgot Password?</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Brand locked to the bottom */}
      <View style={styles.brandContainer}>
        <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
            >
              <AppText style={styles.accountLink}>Create new account</AppText>
            </TouchableOpacity>
        <AppText style={styles.brand}>AgriConnect</AppText>
      </View>
    </SafeAreaView>
  );
}

/* ─────────────────── Fake API (demo only) ─────────────────── */
async function fakeLogin(id: string, pw: string) {
  return new Promise((res, rej) =>
    setTimeout(() => {
      id === 'testuser' && pw === 'Password1'
        ? res(true)
        : rej(new Error('Invalid credentials'));
    }, 1500),
  );
}

/* ───────────────────────── Styles ───────────────────────── */
const PRIMARY   = '#00A000';
const INPUT_BG  = '#E6F3E6';
const BACKDROP  = '#EAF8E5';
const CARD_RAD  = 16;

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: BACKDROP },
  flex1:        { flex: 1 },
  centerBox:    { flex: 1, justifyContent: 'center', padding: 16 },

  /* Card */
  card:         { backgroundColor: '#FFF', borderRadius: CARD_RAD, padding: 20 },

  /* Branding */
  brandContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brand:        { fontSize: 16, fontWeight: '500', color: '#4C794C' },

  /* AppText / inputs */
  title:        { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  input: {
    height: 48,
    backgroundColor: INPUT_BG,
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  inputError:   { borderWidth: 1, borderColor: 'red' },
  error:        { color: 'red', marginBottom: 4 },

  /* Row + checkbox */
  row:          { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  checkbox:     { marginRight: 8 },
  keepText:     { fontSize: 14, color: '#222' },

  /* Buttons */
  primaryBtn:   {
    height: 48,
    backgroundColor: PRIMARY,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  btnDisabled:  { opacity: 0.6 },
  btnText:      { color: '#FFF', fontSize: 16, fontWeight: '600' },
  accountLink:  { color: PRIMARY, textAlign: 'center', marginBottom: 12, fontSize: 18, textDecorationLine: 'underline'  },
  link:         { color: PRIMARY, textAlign: 'center', textDecorationLine: 'underline' },
});
