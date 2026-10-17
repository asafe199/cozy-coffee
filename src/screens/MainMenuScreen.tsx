import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFonts, Figtree_600SemiBold } from '@expo-google-fonts/figtree';
import { useGameStore } from '../state/gameStore';
import { saveProgress } from '../game/persistence';

export function MainMenuScreen({ onStart, ready }: { onStart: () => void; ready: boolean }) {
  // Font loading never gates the buttons; fall back to the system font.
  const [fontsLoaded] = useFonts({ Figtree_600SemiBold });
  const font = fontsLoaded ? { fontFamily: 'Figtree_600SemiBold' } : undefined;
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleSave = () => {
    if (!ready) return;
    const { day, money } = useGameStore.getState();
    saveProgress({ day, money });
    setSaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.logo, font]}>Brewlight</Text>
      <Text style={[styles.subtitle, font]}>SUA CAFETERIA ACONCHEGANTE</Text>
      <Pressable style={styles.primary} onPress={onStart}>
        <Text style={[styles.primaryText, font]}>Iniciar</Text>
      </Pressable>
      <Pressable style={[styles.secondary, !ready && styles.disabled]} onPress={handleSave}>
        <Text style={[styles.secondaryText, font]}>Salvar</Text>
      </Pressable>
      {Platform.OS === 'android' && (
        <Pressable style={styles.secondary} onPress={() => BackHandler.exitApp()}>
          <Text style={[styles.secondaryText, font]}>Sair</Text>
        </Pressable>
      )}
      <Text style={[styles.saved, font, { opacity: saved ? 1 : 0 }]}>{saved ? 'Saved' : ' '}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2B2729', alignItems: 'center', justifyContent: 'center', gap: 14 },
  logo: { color: '#F6E3C7', fontSize: 44, fontWeight: '700' },
  subtitle: { color: '#F3B45A', fontSize: 12, letterSpacing: 2.5, marginBottom: 24 },
  primary: { backgroundColor: '#F3B45A', borderRadius: 14, height: 52, width: 240, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#2B1A10', fontSize: 17 },
  secondary: { backgroundColor: '#4A2F1F', borderRadius: 14, height: 52, width: 240, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#F6E3C7', fontSize: 17 },
  disabled: { opacity: 0.5 },
  saved: { color: '#F6E3C7', fontSize: 14, marginTop: 8 },
});
