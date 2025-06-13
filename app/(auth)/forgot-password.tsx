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
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as yup from 'yup';

/* ───── Validation ───── */
const schema = yup.object({
  identifier: yup
    .string()
    .required('Email or phone is required')
    .test('email-or-phone', 'Enter a valid email or phone number', (v = '') => {
      const mailRx  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRx = /^[0-9]{7,15}$/;
      return mailRx.test(v) || phoneRx.test(v);
    }),
});
type FormData = yup.InferType<typeof schema>;

export default function ForgotIdentifier() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  async function onSubmit({ identifier }: FormData) {
    try {
      await fakeSend(identifier); // TODO replace
      Alert.alert('Success', 'Check your inbox / SMS for further steps.');
      router.replace('/(auth)/reset-password');
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
              <View style={{ width: 24 }} />
            </View>

            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your registered email or phone number and we'll send you a reset link/code.
            </Text>

            {/* Identifier */}
            <Controller
              control={control}
              name="identifier"
              defaultValue=""
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Email or Phone"
                  placeholderTextColor="#6B8E6B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    errors.identifier && styles.inputError,
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.identifier && (
              <Text style={styles.error}>{errors.identifier.message}</Text>
            )}

            {/* Send button */}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                isSubmitting && styles.btnDisabled,
              ]}
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.btnText}>
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <View style={styles.brandContainer}>
        <Text style={styles.brand}>AgriConnect</Text>
      </View>
    </SafeAreaView>
  );
}

/* ------- fake API ------- */
async function fakeSend(id: string) {
  return new Promise((res) => setTimeout(res, 1200));
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
