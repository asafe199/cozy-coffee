import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function PlaceholderScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coming soon</Text>
      <Pressable style={styles.button} onPress={onBack}>
        <Text style={styles.buttonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2B2729', alignItems: 'center', justifyContent: 'center', gap: 24 },
  title: { color: '#F6E3C7', fontSize: 28 },
  button: { backgroundColor: '#4A2F1F', borderRadius: 14, height: 52, minWidth: 200, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#F6E3C7', fontSize: 16 },
});
