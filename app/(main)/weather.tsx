import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Weather() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
