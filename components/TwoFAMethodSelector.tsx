import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const TwoFAMethodSelector = ({
  currentMethod,
  onSelect,
}: {
  currentMethod: 'email' | 'authenticator';
  onSelect: (m: 'email' | 'authenticator') => void;
}) => (
  <View style={styles.wrap}>
    {(['email', 'authenticator'] as const).map((m) => (
      <TouchableOpacity
        key={m}
        style={[styles.btn, currentMethod === m && styles.btnActive]}
        onPress={() => onSelect(m)}
      >
        <Text style={currentMethod === m ? styles.txtActive : styles.txt}>
          {m === 'email' ? 'Email' : 'Authenticator'}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  btnActive: { backgroundColor: '#2E7D32' },
  txt: { color: '#222' },
  txtActive: { color: '#FFF', fontWeight: '700' },
});
