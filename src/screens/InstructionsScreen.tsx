import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { t } from '../i18n';
import { useFonts, Figtree_600SemiBold } from '@expo-google-fonts/figtree';

const stepKeys = ['instructionsStep1', 'instructionsStep2', 'instructionsStep3', 'instructionsStep4'] as const;

export function InstructionsScreen({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  // Font loading never gates rendering; fall back to the system font.
  const [fontsLoaded] = useFonts({ Figtree_600SemiBold });
  const font = fontsLoaded ? { fontFamily: 'Figtree_600SemiBold' } : undefined;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, font]}>{t('instructionsTitle')}</Text>
        {stepKeys.map((key, i) => (
          <View key={i} style={styles.step}>
            <Text style={[styles.number, font]}>{i + 1}</Text>
            <Text style={[styles.stepText, font]}>{t(key)}</Text>
          </View>
        ))}
        <Pressable style={styles.primary} onPress={onContinue}>
          <Text style={[styles.primaryText, font]}>{t('continue')}</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={onBack}>
          <Text style={[styles.secondaryText, font]}>{t('back')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2B2729' },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  title: { color: '#F6E3C7', fontSize: 36, fontWeight: '700', marginBottom: 16 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, width: 300, backgroundColor: '#4A2F1F', borderRadius: 14, padding: 14 },
  number: { color: '#F3B45A', fontSize: 22, width: 24, textAlign: 'center' },
  stepText: { color: '#F6E3C7', fontSize: 16, flex: 1 },
  primary: { backgroundColor: '#F3B45A', borderRadius: 14, height: 52, width: 240, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  primaryText: { color: '#2B1A10', fontSize: 17 },
  secondary: { backgroundColor: '#4A2F1F', borderRadius: 14, height: 52, width: 240, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#F6E3C7', fontSize: 17 },
});
