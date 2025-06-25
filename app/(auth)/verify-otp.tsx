// app/(auth)/verify-otp.modal.tsx
// Full‑screen OTP modal that accepts dynamic params via the URL query.
// Launch example:
//   router.push({
//     pathname: '/(auth)/verify-otp',
//     params: {
//       api: 'https://api.example.com/auth/verify-otp',
//       purpose: 'email',
//       email: 'user@domain.com',
//       next: '/welcome'
//     }
//   })

import { AppText } from '@/components/AppText';
import toastConfig from '@/components/toast/toastConfig';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

/* ─────────────────── UI Tokens ─────────────────── */
const COLORS = {
  primary: '#00A000',
  inputBg: '#E6F3E6',
  inputFilled: '#D1E9D1',
  dimBg: 'rgba(0,0,0,0.35)',
};
const CARD_RADIUS = 20;
const OTP_LENGTH = 6;

/* ─────────────────── Screen ─────────────────── */
export default function VerifyOtpModal() {
  /** Grab URL params */
  const params = useLocalSearchParams<Record<string, string>>();
  const { purpose = 'account', api: apiUrlParam, next: nextUriParam } = params;

  // ── React State (MUST appear before early returns) ──
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  /** Derived */
  const isOtpComplete = digits.every((d) => d.length === 1);
  const endpoint = apiUrlParam ?? '';
  const nextUri = (nextUriParam ?? '/(main)') as string;

  /* ---------------------------------------------
     Handle missing API param once component mounts
     ------------------------------------------- */
  useEffect(() => {
    if (!apiUrlParam) {
      Toast.show({
        type: 'error',
        text1: 'Missing API endpoint',
        text2: 'No API endpoint was provided for OTP verification.',
      });
      // Delay the dismissal slightly so toast renders first
      const t = setTimeout(() => router.back(), 500);
      return () => clearTimeout(t);
    }
  }, [apiUrlParam]);

  /* ─────────────────── Handlers ─────────────────── */
  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // allow only one digit 0‑9
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    // Auto‑focus next / previous
    if (value && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const resetOtp = () => setDigits(Array(OTP_LENGTH).fill(''));

  const submitOtp = async () => {
    if (!isOtpComplete || !endpoint) return;
    setSubmitting(true);
    const code = digits.join('').trim();

    // Build payload in the correct format
    const payload: Record<string, unknown> = {
      email: params.email,
      otp: code,
    };

    try {
      await axios.post(endpoint, payload);
      Toast.show({ type: 'success', text1: 'OTP verified!' });
      resetOtp();
      // console.log('OTP verification successful:', resp.data);
      router.replace(nextUri as any); // cast to satisfy TS union of known routes
    } catch (error: any) {
      /*   if (isAxiosError(error)) {
          console.error("Axios request failed", error.response?.data, error.toJSON());
        } else {
          console.error(error);
        } */
      console.log(error.response?.data.message);
      Toast.show({
        type: 'error',
        text1: 'Verification failed',
        text2: error?.response?.data?.message || error.message || 'Unknown error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    resetOtp();
    router.back();
  };

  /* ─────────────────── JSX ─────────────────── */
  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" statusBarTranslucent>
      <SafeAreaView style={styles.wrapper}>
        {/* Close */}
        <TouchableOpacity style={styles.closeBtn} onPress={closeModal} accessibilityLabel="Close">
          <Feather name="x" size={28} color="#000" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.centerBox}>
            <View style={styles.card}>
              <TouchableOpacity onPress={() => router.back()}>
                <Feather name="arrow-left" size={24} color="#000" />
              </TouchableOpacity>
              <AppText style={styles.title}>Verify OTP</AppText>
              <AppText style={styles.subtitle}>
                Enter the 6‑digit code we sent to {params.email} .
              </AppText>

              {/* OTP inputs */}
              <View style={styles.otpRow}>
                {Array.from({ length: OTP_LENGTH }, (_, i) => (
                  <TextInput
                    key={i}
                    ref={(ref) => {
                      inputs.current[i] = ref ?? null;
                    }}
                    value={digits[i]}
                    onChangeText={(v) => handleChange(i, v)}
                    style={[styles.otpBox, digits[i] ? styles.otpFilled : undefined]}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    maxLength={1}
                    autoFocus={i === 0}
                    autoCapitalize="none"
                    importantForAutofill="no"
                    keyboardAppearance="light"
                    accessibilityLabel={`Digit ${i + 1}`}
                  />
                ))}
              </View>

              {/* Verify */}
              <TouchableOpacity
                style={[styles.primaryBtn, (!isOtpComplete || submitting) && styles.btnDisabled]}
                disabled={!isOtpComplete || submitting}
                onPress={submitOtp}
                accessibilityLabel="Verify OTP"
              >
                <AppText style={styles.btnText}>{submitting ? 'Verifying…' : 'Verify'}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
         <View style={styles.brandContainer}>
                <AppText style={styles.brand}>AgriConnect</AppText>
              </View>
      </SafeAreaView>
      <Toast config={toastConfig}/>
    </Modal>
  );
}

/* ─────────────────── Styles ─────────────────── */
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.dimBg,
  },
  flex1: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 6,
    elevation: 4,
  },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: CARD_RADIUS,
    paddingVertical: 32,
    paddingHorizontal: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 28, color: '#444', lineHeight: 22 },

  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 36 },
  otpBox: {
    width: 52,
    height: 60,
    borderRadius: 10,
    backgroundColor: COLORS.inputBg,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '600',
  },
  otpFilled: { backgroundColor: COLORS.inputFilled },

  primaryBtn: {
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
