import { AppText } from '@/components/AppText';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

/* ─────────────────── Config ─────────────────── */
const PRIMARY = '#00A000';
const INPUT_BG = '#E6F3E6';
const BACKDROP = '#EAF8E5';
const CARD_RAD = 16;
const BOX_COUNT = 6;

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

/* ─────────────────── Screen ─────────────────── */
export default function VerifyOtpModal({apiPath, apiPurpose, nextUri, otpsentto}: {apiPath: string, apiPurpose: string}) {
  /** Allow caller to specify what kind of OTP this is for ("email", "sms", etc.) */
  
  const [digits, setDigits] = useState<string[]>(Array(BOX_COUNT).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const isComplete = digits.every((d) => d.length === 1);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // Only digits, max 1 char

    /* Update local state */
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    /* Auto‑move focus */
    if (value && index < BOX_COUNT - 1) {
      inputs.current[index + 1]?.focus();
    }
    if (!value && index > 0) {
      // When clearing, move back
      inputs.current[index - 1]?.focus();
    }
  };

  async function submitOtp() {
    if (!isComplete) return;
    setSubmitting(true);
    const code = digits.join('');
    try {
      
      await axios.post(`${API_BASE}/${apiPath}`, {
        code, 
      });
      Alert.alert('Success', 'OTP verified!');
      router.replace({nextUri});
    } catch (e: any) {
      Alert.alert('Verification failed', e?.response?.data?.message || e.message || 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
     <Modal visible animationType="slide" presentationStyle="fullScreen" statusBarTranslucent>
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
              <AppText style={styles.headerTitle}>Verify&nbsp;OTP</AppText>
              <View style={{ width: 24 }} />
            </View>

            <AppText style={styles.subtitle}>
              Enter the 6‑digit code we sent to your {otpsentto}.
            </AppText>

            {/* -------- OTP boxes -------- */}
            <View style={styles.otpRow}>
              {Array.from({ length: BOX_COUNT }, (_, i) => (
                <TextInput
                  key={i}
                  ref={(ref) => (inputs.current[i] = ref)}
                  value={digits[i]}
                  onChangeText={(v) => handleChange(i, v)}
                  style={[styles.otpBox, digits[i] ? styles.otpFilled : null]}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  maxLength={1}
                  autoFocus={i === 0}
                />
              ))}
            </View>

            {/* Verify button */}
            <TouchableOpacity
              style={[styles.primaryBtn, (!isComplete || submitting) && styles.btnDisabled]}
              disabled={!isComplete || submitting}
              onPress={submitOtp}
            >
              <AppText style={styles.btnText}>{submitting ? 'Verifying…' : 'Verify'}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Brand pinned to bottom */}
      <View style={styles.brandContainer}>
        <AppText style={styles.brand}>AgriConnect</AppText>
      </View>
    </SafeAreaView>
    </Modal>
  );
}

/* ─────────────────── Styles ─────────────────── */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKDROP },
  flex1: { flex: 1 },
  centerBox: { flexGrow: 1, justifyContent: 'center', padding: 16 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: CARD_RAD,
    paddingVertical: 28,
    paddingHorizontal: 24,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  subtitle: { textAlign: 'center', marginBottom: 24, color: '#444', lineHeight: 22 },

  /* OTP */
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  otpBox: {
    width: 50,
    height: 56,
    borderRadius: 8,
    backgroundColor: INPUT_BG,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  otpFilled: {
    backgroundColor: '#D1E9D1',
  },

  primaryBtn: {
    height: 48,
    backgroundColor: PRIMARY,
    borderRadius: 6,
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
