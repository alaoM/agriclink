import { useEnable2FA, useVerify2FA } from '@/hooks/useEnable2FA';
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

type Method = 'email' | 'authenticator';

interface Props {
    visible: boolean;
    onClose: () => void;
    selectedMethod: Method;
}

const TwoFAModal: React.FC<Props> = ({ visible, onClose, selectedMethod }) => {
    /* ---------------- state ---------------- */
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const inputs = useRef<TextInput[]>([]);

    const enable2FA = useEnable2FA();
    const verifyOTP = useVerify2FA();

    /* ── when modal opens ── */
    useEffect(() => {
        if (visible) {
            setOtp(['', '', '', '', '', '']);
            setQrCode(null);
            setSecret(null);

            enable2FA.mutate(selectedMethod, {
                onSuccess: (data) => {
                    if (selectedMethod === 'authenticator') {
                        setQrCode(data.qrCode);
                        setSecret(data.secret);
                    }
                },
                onError: () =>
                    Alert.alert('Error', 'Failed to start 2-factor setup.'),
            });
        }
    }, [visible, selectedMethod, enable2FA]);

    /* ── verify button ── */
    // onPress={() =>
    //   verifyOTP.mutate(otp.join(''), {
    //     onSuccess: () => {
    //       Alert.alert('Success', 'Two-factor authentication enabled!');
    //       onClose();
    //     },
    //     onError: () =>
    //       Alert.alert('Invalid Code', 'Please try again.'),
    //   })
    // }


    /* ---------------- helpers ---------------- */
    const handleChange = (t: string, i: number) => {
        if (!/^\d?$/.test(t)) return; // allow only one digit
        const next = [...otp];
        next[i] = t;
        setOtp(next);
        if (t && i < 5) inputs.current[i + 1]?.focus();
    };

    const allFilled = otp.every((d) => d.length === 1);

    /* ---------------- UI ---------------- */
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.backdrop}>
                <View style={styles.box}>
                    <Text style={styles.title}>
                        {selectedMethod === 'email'
                            ? 'Enter the code sent to your email'
                            : 'Scan QR and enter code'}
                    </Text>

                    {selectedMethod === 'authenticator' && qrCode && (
                        <>
                            <Image source={{ uri: qrCode }} style={styles.qr} />
                            {secret && <Text style={styles.secret}>Secret: {secret}</Text>}
                        </>
                    )}

                    {/* six inputs */}
                    <View style={styles.otpWrap}>
                        {otp.map((val, i) => (
                            <TextInput
                                key={i}
                                ref={(r) => (inputs.current[i] = r!)}
                                style={styles.input}
                                keyboardType="number-pad"
                                maxLength={1}
                                value={val}
                                onChangeText={(t) => handleChange(t, i)}
                            />
                        ))}
                    </View>

                    <Pressable
                        style={[styles.btn, (!allFilled ) && { opacity: 0.5 }]}
                        disabled={!allFilled || verifyOTP.isPending}
                        onPress={() =>
                            verifyOTP.mutate(otp.join(''), {
                                onSuccess: () => {
                                    Alert.alert('Success', 'Two-factor authentication enabled!');
                                    onClose();
                                },
                                onError: () =>
                                    Alert.alert('Invalid Code', 'Please try again.'),
                            })

                        }
                    >
                        <Text style={styles.btnTxt}>Verify</Text>
                    </Pressable>

                    <Pressable style={styles.cancel} onPress={onClose}>
                        <Text style={{ color: '#444' }}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

/* ---------------- styles ---------------- */
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
    title: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
    qr: { width: 160, height: 160, marginBottom: 12 },
    secret: { fontSize: 12, marginBottom: 14, color: '#555' },
    otpWrap: { flexDirection: 'row', gap: 8, marginVertical: 14 },
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
