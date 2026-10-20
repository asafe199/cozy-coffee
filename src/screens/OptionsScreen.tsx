import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../i18n';
import { useFonts, Figtree_600SemiBold } from '@expo-google-fonts/figtree';
import { useSettingsStore } from '../game/settings';
import type { Lang } from '../i18n';

const LANGS: { id: Lang; label: string }[] = [
  { id: 'pt', label: 'PT' },
  { id: 'en', label: 'EN' },
  { id: 'es', label: 'ES' },
];

// Attribution required by the CC-BY 3.0 assets used for the higher coffee-machine
// tiers (docs/ASSETS.md). Names/links aren't translated — attribution text stays
// as the author published it, regardless of UI language.
const ASSET_CREDITS = [
  '"Espresso Pot" by Poly by Google — poly.pizza/m/fsqUynYjKyA (CC-BY 3.0)',
  '"Coffee Machine" by J-Toastie — poly.pizza/m/7kKSsnCcNC (CC-BY 3.0)',
  '"Coffee Maker" by Daqian Dong — poly.pizza/m/f9PvGRKy5NJ (CC-BY 3.0)',
];

export function OptionsScreen({ onBack }: { onBack: () => void }) {
  const [fontsLoaded] = useFonts({ Figtree_600SemiBold });
  const font = fontsLoaded ? { fontFamily: 'Figtree_600SemiBold' } : undefined;
  const hints = useSettingsStore((state) => state.hints);
  const setHints = useSettingsStore((state) => state.setHints);
  const lang = useSettingsStore((state) => state.lang);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const [showCredits, setShowCredits] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, font]}>{t('optionsTitle')}</Text>
      <Pressable style={styles.row} onPress={() => setHints(!hints)}>
        <Text style={[styles.label, font]}>{t('optionsHints')}</Text>
        <Text style={[styles.value, font]}>{hints ? t('optionsOn') : t('optionsOff')}</Text>
      </Pressable>
      <View style={styles.row}>
        <Text style={[styles.label, font]}>{t('optionsLanguage')}</Text>
        <View style={styles.langs}>
          {LANGS.map((l) => (
            <Pressable key={l.id} onPress={() => setLanguage(l.id)} accessibilityLabel={l.label}>
              <Text style={[styles.lang, lang === l.id && styles.langActive, font]}>{l.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Pressable style={styles.row} onPress={() => setShowCredits(!showCredits)}>
        <Text style={[styles.label, font]}>{t('optionsCredits')}</Text>
        <Text style={[styles.value, font]}>{showCredits ? '▲' : '▼'}</Text>
      </Pressable>
      {showCredits && (
        <View style={styles.creditsBox}>
          {ASSET_CREDITS.map((line) => (
            <Text key={line} style={[styles.creditLine, font]}>{line}</Text>
          ))}
        </View>
      )}
      <Pressable style={styles.back} onPress={onBack}>
        <Text style={[styles.backText, font]}>{t('back')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2B2729', alignItems: 'center', justifyContent: 'center', gap: 18 },
  title: { color: '#F6E3C7', fontSize: 28 },
  row: {
    backgroundColor: '#4A2F1F',
    borderRadius: 14,
    height: 56,
    width: 280,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { color: '#F6E3C7', fontSize: 17 },
  value: { color: '#F3B45A', fontSize: 17 },
  langs: { flexDirection: 'row', gap: 12 },
  lang: { color: '#B79A7C', fontSize: 17 },
  langActive: { color: '#F3B45A', textDecorationLine: 'underline' },
  creditsBox: { backgroundColor: '#4A2F1F', borderRadius: 14, width: 280, padding: 14, gap: 6 },
  creditLine: { color: '#B79A7C', fontSize: 12 },
  back: { backgroundColor: '#4A2F1F', borderRadius: 14, height: 52, width: 240, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#F6E3C7', fontSize: 17 },
});
