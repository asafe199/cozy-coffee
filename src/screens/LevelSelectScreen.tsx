import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFonts, Figtree_600SemiBold } from '@expo-google-fonts/figtree';

const LEVELS = [
  { level: 1, name: 'Cafeteria simples' },
  { level: 2, name: 'Cantinho aconchegante' },
  { level: 3, name: 'Café de bairro' },
  { level: 4, name: 'Café charmoso' },
  { level: 5, name: 'Café sofisticado' },
];

export function LevelSelectScreen({
  onSelectLevel,
  onBack,
}: {
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}) {
  // Font loading never gates rendering; fall back to the system font.
  const [fontsLoaded] = useFonts({ Figtree_600SemiBold });
  const font = fontsLoaded ? { fontFamily: 'Figtree_600SemiBold' } : undefined;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, font]}>Escolha seu nível</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
        {LEVELS.map(({ level, name }) => {
          const unlocked = level === 1;
          return (
            <Pressable
              key={level}
              style={[styles.card, !unlocked && styles.locked]}
              onPress={unlocked ? () => onSelectLevel(level) : undefined}
            >
              <Text style={[styles.cardTitle, font]}>{`Nível ${level}`}</Text>
              <Text style={[styles.cardName, font]}>{name}</Text>
              {!unlocked && <Text style={[styles.lockedText, font]}>Bloqueado</Text>}
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable style={styles.back} onPress={onBack}>
        <Text style={[styles.backText, font]}>Voltar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2B2729', alignItems: 'center', paddingTop: 48, paddingBottom: 24 },
  title: { color: '#F6E3C7', fontSize: 28, marginBottom: 16 },
  scroll: { flex: 1, width: '100%' },
  list: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  card: { backgroundColor: '#4A2F1F', borderRadius: 14, width: 280, padding: 16, borderWidth: 1, borderColor: '#F3B45A' },
  locked: { opacity: 0.45, borderColor: '#4A2F1F' },
  cardTitle: { color: '#F3B45A', fontSize: 18 },
  cardName: { color: '#F6E3C7', fontSize: 15, marginTop: 4 },
  lockedText: { color: '#F6E3C7', fontSize: 12, letterSpacing: 1.5, marginTop: 6 },
  back: { backgroundColor: '#4A2F1F', borderRadius: 14, height: 52, width: 240, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  backText: { color: '#F6E3C7', fontSize: 17 },
});
