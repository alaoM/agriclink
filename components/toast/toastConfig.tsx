import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';

interface CustomToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}

const STATUS_TOP = Platform.OS === 'android'
  ? (StatusBar.currentHeight ?? 24) + 8 // 8‑px extra spacing on Android
  : 16;

const toastConfig = {
  error: ({ text1, text2 }: CustomToastProps) => (
    <View style={[styles.toastContainer, styles.errorBorder, styles.errorBackground]}>
      <View style={styles.textBlock}>
        {text1 && <Text style={styles.errorText}>{text1}</Text>}
        {text2 && <Text style={styles.errorSubText}>{text2}</Text>}
      </View>
    </View>
  ),

  success: ({ text1, text2 }: CustomToastProps) => (
    <View style={[styles.toastContainer, styles.successBorder, styles.successBackground]}>
      <View style={styles.textBlock}>
        {text1 && <Text style={styles.successText}>{text1}</Text>}
        {text2 && <Text style={styles.successSubText}>{text2}</Text>}
      </View>
    </View>
  ),

  delete: ({ text1, text2 }: CustomToastProps) => (
    <View style={[styles.toastContainer, styles.errorBorder, styles.errorBackground]}>
      <View style={styles.textBlock}>
        {text1 && <Text style={styles.errorText}>{text1}</Text>}
        {text2 && <Text style={styles.errorSubText}>{text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '90%',
    marginTop: STATUS_TOP,
    padding: 12,
    borderRadius: 8,
  },
  textBlock: {
    flexDirection: 'column',
  },
  // Success styles
  successBorder: {
    borderWidth: 1,
    borderColor: '#ABEFC6',
  },
  successBackground: {
    backgroundColor: '#ECFDF3',
  },
  successText: {
    color: '#067647',
    fontSize: 12,
    fontWeight: '600',
  },
  successSubText: {
    color: '#067647',
    fontSize: 12,
    marginTop: 4,
  },

  // Error/Delete styles
  errorBorder: {
    borderWidth: 1,
    borderColor: '#D92D20',
  },
  errorBackground: {
    backgroundColor: '#FEF3F2',
  },
  errorText: {
    color: '#D92D20',
    fontSize: 12,
    fontWeight: '600',
  },
  errorSubText: {
    color: '#D92D20',
    fontSize: 12,
    marginTop: 4,
  },
});

export default toastConfig;
