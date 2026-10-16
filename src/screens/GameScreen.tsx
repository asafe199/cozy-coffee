import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFonts, Figtree_600SemiBold } from '@expo-google-fonts/figtree';
import { GameScene } from '../scenes/GameScene';
import { FadeTransition } from '../scenes/FadeTransition/FadeTransition';
import { useGameStore } from '../state/gameStore';

// Direction A "Madeira & Âmbar" palette (docs/superpowers/specs/2026-10-16-brewlight-menu-tipografia.md).
const NOGUEIRA = '#4A2F1F';
const CREME = '#F6E3C7';

/**
 * The app's single screen: the 3D canvas filling the screen, the fade-cut
 * overlay as a sibling on top of it, and a minimal HUD showing the most
 * recent review's star count. Font loading only gates the HUD text, not the
 * Canvas — the game is playable even before Figtree finishes loading.
 */
export function GameScreen() {
  const [fontsLoaded] = useFonts({ Figtree_600SemiBold });
  const reviews = useGameStore((state) => state.reviews);
  const lastStars = reviews[reviews.length - 1]?.stars;
  const scene = useGameStore((state) => state.scene);
  const currentOrder = useGameStore((state) => state.currentOrder);

  const orderLabel = currentOrder
    ? `Coffee${currentOrder.wantsSugar ? ' with sugar' : ''}`
    : 'Tap for next order';

  return (
    <View style={styles.container}>
      <GameScene />
      <FadeTransition />
      <View style={styles.hud} pointerEvents="none">
        {fontsLoaded && (
          <Text style={styles.hudText}>
            {lastStars ? `${'★'.repeat(lastStars)}${'☆'.repeat(5 - lastStars)}` : 'No reviews yet'}
          </Text>
        )}
      </View>
      {scene === 'orderBoard' && (
        <View style={styles.orderLabel} pointerEvents="none">
          {fontsLoaded && <Text style={styles.orderLabelText}>{orderLabel}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hud: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: `${NOGUEIRA}CC`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  hudText: {
    color: CREME,
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
  },
  orderLabel: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: `${NOGUEIRA}CC`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  orderLabelText: {
    color: CREME,
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
  },
});
