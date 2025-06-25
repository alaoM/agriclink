// components/TwoFAModal.tsx
import { useVerify2FA } from '@/hooks/useEnable2FA'; // ← same file that exports both hooks
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    method: 'email' | 'authenticator';
    qrCode?: string | null;
    secret?: string | null;
}

const TwoFAModal: React.FC<Props> = ({
    visible,
    onClose,
    method,
    qrCode,
    secret,
}) => {
    /* ------------- OTP state ------------- */
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const inputs = useRef<TextInput[]>([]);

    /* ------------- verify mutation ------------- */
    // 1️⃣  create the mutation object with no params
    const verifyOTP = useVerify2FA();   // { mutate, isPending, … }

    // 2️⃣  call mutate and supply callbacks there
    const submitCode = () =>
        verifyOTP.mutate(otp.join(''), {
            onSuccess: () => {
                Alert.alert('Success', 'Two-factor authentication enabled!');
                onClose();
            },
            onError: () => {
                Alert.alert('Invalid code', 'Please try again.');
            },
        });
    /* ------------- helpers ------------- */
    const handleChange = (text: string, index: number) => {
        if (!/^\d?$/.test(text)) return; // allow one digit
        const next = [...otp];
        next[index] = text;
        setOtp(next);

        // focus next input automatically
        if (text && index < 5) inputs.current[index + 1]?.focus();
    };

    const allFilled = otp.every((d) => d.length === 1);

    /* ------------- reset when reopened ------------- */
    useEffect(() => {
        if (visible) setOtp(['', '', '', '', '', '']);
    }, [visible]);

    /* ------------- UI ------------- */
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.backdrop}>
                <View style={styles.box}>
                    <Text style={styles.title}>
                        {method === 'email'
                            ? 'Enter the code sent to your email'
                            : 'Scan the QR code and enter the code from your authenticator app'}
                    </Text>

                    {method === 'authenticator' && qrCode && (
                        <>
                            <Image source={{ uri: qrCode }} style={styles.qr} />
                            {secret && <Text style={styles.secret}>Secret: {secret}</Text>}
                        </>
                    )}

                    {/* OTP inputs */}
                    <View style={styles.otpRow}>
                        {otp.map((digit, idx) => (
                            <TextInput
                                key={idx}
                                ref={(r) => (inputs.current[idx] = r!)}
                                style={styles.input}
                                keyboardType="number-pad"
                                maxLength={1}
                                value={digit}
                                onChangeText={(t) => handleChange(t, idx)}
                            />
                        ))}
                    </View>

                    <Pressable
                        style={[styles.btn, (!allFilled || verifyOTP.isPending) && { opacity: 0.5 }]}
                        disabled={!allFilled || verifyOTP.isPending}
                        onPress={submitCode}
                    >
                        <Text style={styles.btnTxt}>
                            {verifyOTP.isPending ? 'Verifying…' : 'Verify'}
                        </Text>
                    </Pressable>

                    <Pressable style={styles.cancel} onPress={onClose}>
                        <Text style={{ color: '#444' }}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

/* ---------- styles ---------- */
const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: '#0009',
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        width: '88%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
    },
    qr: { width: 160, height: 160, marginBottom: 12 },
    secret: { fontSize: 12, marginBottom: 14, color: '#555' },
    otpRow: { flexDirection: 'row', gap: 8, marginVertical: 14 },
    input: {
        width: 42,
        height: 48,
        borderBottomWidth: 1,
        borderColor: '#888',
        textAlign: 'center',
        fontSize: 20,
    },
    btn: {
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 28,
    },
    btnTxt: { color: '#FFF', fontWeight: '700' },
    cancel: { marginTop: 12 },
});

export default TwoFAModal;
