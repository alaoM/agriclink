import { AppText } from '@/components/AppText';
import { useAuth } from '@/contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import toastConfig from './toast/toastConfig';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

const COLORS = {
    primary: '#00A000',
    inputBg: '#E6F3E6',
    inputFilled: '#D1E9D1',
    dimBg: 'rgba(0,0,0,0.35)',
};

const OTP_LENGTH = 6;

type Props = {
    visible: boolean;
    onClose: () => void;
    email: string;
    password: string;
    method: 'email' | 'authenticator' | null;
};

const STATUS_TOP =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 16;


const LoginTFA: React.FC<Props> = ({ visible, onClose, email, password, method }) => {

    const { signIn } = useAuth();

    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [submitting, setSubmitting] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(60);
    const resendTimer = useRef<NodeJS.Timeout | null>(null);

    const inputs = useRef<(TextInput | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newDigits = [...digits];
        newDigits[index] = value;
        setDigits(newDigits);

        if (value && index < OTP_LENGTH - 1) {
            inputs.current[index + 1]?.focus();
        }

        if (!value && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const isOtpComplete = digits.every((digit) => digit !== '');

    const submitOtp = async () => {
        if (!isOtpComplete) {
            Toast.show({ type: 'error', text1: 'Enter the 6-digit code' });
            return;
        }

        try {
            setSubmitting(true);
            const otp = digits.join('');

            const response = await axios.post(
                `${API_BASE}/api/auth/login`,
                {
                    username: email,
                    password,
                    token: otp,
                    keepSignedIn: true,
                },
                { headers: { 'Content-Type': 'application/json' } }
            );

            const { token, user } = response.data;
            await signIn({ token, user, remember: true });

            Toast.show({ type: 'success', text1: 'Login successful' });
            onClose();
            router.replace('/(main)');
        } catch (error: any) {
            console.error('2FA error:', error?.response || error);
            const message = error?.response?.data?.message || 'Invalid code or expired session';
            Toast.show({ type: 'error', text1: '2FA Verification Failed', text2: message });
        } finally {
            setSubmitting(false);
        }
    };




    useEffect(() => {
        if (visible && method === 'email') {
            startResendCountdown();
        }

        return () => {
            if (resendTimer.current) clearInterval(resendTimer.current);
        };
    }, [visible, method]);

    const startResendCountdown = () => {
        setResendCountdown(60);
        if (resendTimer.current) clearInterval(resendTimer.current);

        resendTimer.current = setInterval(() => {
            setResendCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(resendTimer.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResendEmailCode = async () => {
        try {
            await axios.post(`${API_BASE}/api/auth/resend-otp`, { method: 'email' });
            setDigits(Array(OTP_LENGTH).fill('')); 
            Toast.show({ type: 'success', text1: 'Code resent to your email' });
            startResendCountdown();
        } catch (error: any) {
            console.error('Resend error:', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to resend',
                text2: error?.response?.data?.message || 'Please try again later.',
            });
        }
    };

    return (
        <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
            <SafeAreaView style={styles.wrapper}>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Feather name="x" size={28} color="#000" />
                </TouchableOpacity>

                <KeyboardAvoidingView
                    style={styles.flex1}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.centerBox}>
                        <View style={styles.card}>
                            <AppText style={styles.title}>Two Factor Authentication</AppText>

                            {method === 'email' && (
                                <AppText style={styles.desc}>Enter the 6-digit code sent to your email</AppText>
                            )}
                            {method === 'authenticator' && (
                                <AppText style={styles.desc}>Enter the 6-digit code from your Authenticator app</AppText>
                            )}

                            <View style={styles.otpRow}>
                                {Array.from({ length: OTP_LENGTH }, (_, i) => (
                                    <TextInput
                                        key={i}
                                        ref={(ref) => (inputs.current[i] = ref)}
                                        value={digits[i]}
                                        onChangeText={(v) => handleChange(i, v)}
                                        style={[styles.otpBox, digits[i] ? styles.otpFilled : undefined]}
                                        keyboardType="number-pad"
                                        returnKeyType="done"
                                        maxLength={1}
                                        autoFocus={i === 0}
                                        importantForAutofill="no"
                                    />
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.verifyBtn, !isOtpComplete || submitting ? styles.disabledBtn : null]}
                                onPress={submitOtp}
                                disabled={!isOtpComplete || submitting}
                            >
                                <AppText style={styles.btnText}>
                                    {submitting ? 'Verifying...' : 'Verify'}
                                </AppText>
                            </TouchableOpacity>
                            {method === 'email' && (
                                <View style={styles.resendBox}>
                                    <AppText style={styles.resendText}>
                                        Didn’t get the code?
                                    </AppText>
                                    <TouchableOpacity
                                        disabled={resendCountdown > 0}
                                        onPress={handleResendEmailCode}
                                    >
                                        <AppText
                                            style={[
                                                styles.resendBtn,
                                                resendCountdown > 0 && { opacity: 0.5 },
                                            ]}
                                        >
                                            {resendCountdown > 0
                                                ? `Resend in ${resendCountdown}s`
                                                : 'Resend Code'}
                                        </AppText>
                                    </TouchableOpacity>
                                </View>
                            )}

                        </View>
                    </View>
                </KeyboardAvoidingView>

                <View style={styles.brandContainer}>
                    <AppText style={styles.brand}>AgricLink</AppText>
                </View>
           
            </SafeAreaView>
                 <Toast config={toastConfig} />
        </Modal>
    );
};


const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: COLORS.dimBg,
        paddingTop: STATUS_TOP
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
        borderRadius: 20,
        paddingVertical: 32,
        paddingHorizontal: 24,
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
    },
    title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
    desc: {
        fontSize: 14,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
    },
    otpBox: {
        width: 52,
        height: 60,
        borderRadius: 10,
        backgroundColor: COLORS.inputBg,
        textAlign: 'center',
        fontSize: 26,
        fontWeight: '600',
        color: '#000',
    },
    otpFilled: {
        backgroundColor: COLORS.inputFilled,
    },
    verifyBtn: {
        height: 50,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledBtn: {
        opacity: 0.6,
    },
    btnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    brand: {
        fontSize: 16,
        color: '#888',
    },
    resendBox: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    resendText: {
        fontSize: 14,
        color: '#333',
    },
    resendBtn: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
        color: COLORS.primary,
    },
});


export default LoginTFA;
