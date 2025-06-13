import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import * as yup from 'yup';

/* ───── Validation: 6‑digit numeric code ───── */
const schema = yup.object({
  code: yup
    .string()
    .required('Verification code is required')
    .matches(/^\d{6}$/, 'Enter the 6‑digit code sent to you'),
});
type FormData = yup.InferType<typeof schema>;

export default function VerifyEmail() {
  const { email } = useLocalSearchParams<{ email?: string }>(); // optional prefill

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  async function onSubmit({ code }: FormData) {
    try {
      await fakeVerify(email ?? '', code); // replace with API
      router.replace('/(main)');
    } catch (e: any) {
      Alert.alert('Invalid code', e.message || 'Please try again');
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
              <View style={{ width: 24 }} />
            </View>

            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              Enter the 6‑digit code we sent to {email ?? 'your email'}.
            </Text>

            {/* Code input */}
            <Controller
              control={control}
              name="code"
              defaultValue=""
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="123456"
                  placeholderTextColor="#6B8E6B"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={[
                    styles.input,
                    errors.code && styles.inputError,
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.code && <Text style={styles.error}>{errors.code.message}</Text>}

            {/* Verify button */}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                isSubmitting && styles.btnDisabled,
              ]}
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.btnText}>
                {isSubmitting ? 'Verifying…' : 'Verify'}
              </Text>
            </TouchableOpacity>

            {/* Resend link */}
            <TouchableOpacity onPress={() => Alert.alert('Resent!', 'Check your inbox.')}>
              <Text style={styles.link}>Resend code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Brand at bottom */}
      <View style={styles.brandContainer}>
        <Text style={styles.brand}>AgriConnect</Text>
      </View>
    </SafeAreaView>
  );
}

/* ------- fake API ------- */
async function fakeVerify(email: string, code: string) {
  return new Promise((res, rej) =>
    setTimeout(() => (code === '123456' ? res(true) : rej(new Error('Bad code'))), 1200),
  );
}


/* ---------- shared styles ---------- */
const PRIMARY   = '#00A000';
const INPUT_BG  = '#E6F3E6';
const BACKDROP  = '#EAF8E5';
const CARD_RAD  = 16;

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: BACKDROP },
  flex1:        { flex: 1 },
  centerBox:    { flexGrow: 1, justifyContent: 'center', padding: 16 },

  card:         { backgroundColor: '#FFF', borderRadius: CARD_RAD, padding: 20 },

  headerRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },

  title:        { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle:     { fontSize: 14, color: '#555', marginBottom: 24 },

  input: {
    height: 48,
    backgroundColor: INPUT_BG,
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  inputError:   { borderWidth: 1, borderColor: 'red' },
  error:        { color: 'red', marginTop: -4, marginBottom: 8 },

  primaryBtn: {
    height: 48,
    backgroundColor: PRIMARY,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  btnDisabled:  { opacity: 0.6 },
  btnText:      { color: '#FFF', fontSize: 16, fontWeight: '600' },

  link:         { color: PRIMARY, textAlign: 'center', textDecorationLine: 'underline' },

  brandContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brand:        { fontSize: 16, fontWeight: '500', color: '#4C794C' },
});

