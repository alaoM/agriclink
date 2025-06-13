// app/(auth)/register.tsx
import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as yup from 'yup';

/* ─────────────────── Validation ─────────────────── */
const schema = yup.object().shape({
  firstName:    yup.string().required('First name is required').min(2, 'Too short'),
  lastName:     yup.string().required('Last name is required').min(2, 'Too short'),
  email:        yup.string().required('Email is required').email('Invalid email'),
  mobile:       yup.string()
                   .required('Mobile number is required')
                   .matches(/^[0-9]{7,15}$/, 'Invalid phone'),
  address:      yup.string().required('Address is required').min(5, 'Too short'),
  username:     yup.string()
                   .required('Username is required')
                   .matches(/^[a-zA-Z0-9_]{3,25}$/, '3‑25 letters, digits or _'),
  password:     yup.string()
                   .required('Password is required')
                   .min(8,  'Min 8 characters')
                   .matches(/[a-z]/, 'Need a lowercase letter')
                   .matches(/[A-Z]/, 'Need an uppercase letter')
                   .matches(/\d/,  'Need a number'),
});

type FormData = yup.InferType<typeof schema>;

/* ─────────────────── Screen ─────────────────── */
export default function RegisterScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await fakeRegister(data);        // TODO replace with real API
      router.replace('/(main)');
    } catch (e: any) {
      Alert.alert('Registration failed', e.message || 'Unknown error');
    }
  }

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
              <Text style={styles.headerTitle}>Register</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* -------- inputs -------- */}
            {inputSpec.map(({ name, label, secure }) => (
              <View key={name} style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <Controller
                  control={control}
                  name={name as keyof FormData}
                  defaultValue=""
                  render={({ field: { onBlur, onChange, value } }) => (
                    <TextInput
                      placeholder={`Enter your ${label.toLowerCase()}`}
                      placeholderTextColor="#6B8E6B"
                      secureTextEntry={secure}
                      style={[
                        styles.input,
                        errors[name as keyof FormData] && styles.inputError,
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors[name as keyof FormData] && (
                  <Text style={styles.error}>
                    {errors[name as keyof FormData]?.message as string}
                  </Text>
                )}
              </View>
            ))}

            {/* Register button */}
            <TouchableOpacity
              style={[styles.primaryBtn, isSubmitting && styles.btnDisabled]}
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.btnText}>
                {isSubmitting ? 'Creating account…' : 'Register'}
              </Text>
            </TouchableOpacity>

            {/* Sign‑in link */}
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.link}>
                Already have an account? <Text style={{ fontWeight: '600' }}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Brand pinned to bottom */}
      <View style={styles.brandContainer}>
        <Text style={styles.brand}>AgriConnect</Text>
      </View>
    </SafeAreaView>
  );
}

/* list used to drive form creation */
const inputSpec = [
  { name: 'firstName',  label: 'First Name' },
  { name: 'lastName',   label: 'Last Name'  },
  { name: 'email',      label: 'Email'      },
  { name: 'mobile',     label: 'Mobile Number' },
  { name: 'address',    label: 'Address'    },
  { name: 'username',   label: 'Username'   },
  { name: 'password',   label: 'Password', secure: true },
] as const;

/* ─────────────────── Fake API ─────────────────── */
async function fakeRegister(data: FormData) {
  return new Promise((res) => setTimeout(res, 1500));
}

/* ─────────────────── Styles ─────────────────── */
const PRIMARY   = '#00A000';
const INPUT_BG  = '#E6F3E6';
const BACKDROP  = '#EAF8E5';
const CARD_RAD  = 16;

const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: BACKDROP },
  flex1:           { flex: 1 },
  centerBox:       { flexGrow: 1, justifyContent: 'center', padding: 16 },

  card:            { backgroundColor: '#FFF', borderRadius: CARD_RAD, padding: 20 },

  headerRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle:     { fontSize: 18, fontWeight: '600' },

  inputGroup:      { marginBottom: 12 },
  label:           { fontSize: 14, marginBottom: 4, color: '#222' },
  input: {
    height: 48,
    backgroundColor: INPUT_BG,
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  inputError:      { borderWidth: 1, borderColor: 'red' },
  error:           { color: 'red', marginTop: 2 },

  primaryBtn: {
    height: 48,
    backgroundColor: PRIMARY,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  btnDisabled:     { opacity: 0.6 },
  btnText:         { color: '#FFF', fontSize: 16, fontWeight: '600' },

  link:            { color: PRIMARY, textAlign: 'center', textDecorationLine: 'underline' },

  brandContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brand:           { fontSize: 16, fontWeight: '500', color: '#4C794C' },
});
