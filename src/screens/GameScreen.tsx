import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFonts, Figtree_600SemiBold } from '@expo-google-fonts/figtree';
import { GameScene } from '../scenes/GameScene';
import { FadeTransition } from '../scenes/FadeTransition/FadeTransition';
import { useGameStore } from '../state/gameStore';
import { formatClock } from '../game/shift';
import { describeOrder } from '../game/orders';
import { useOrderArrivals } from '../state/useOrderArrivals';
import { OrderQueueOverlay } from './OrderQueueOverlay';

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
  useOrderArrivals();
  const reviews = useGameStore((state) => state.reviews);
  const lastStars = reviews[reviews.length - 1]?.stars;
  const scene = useGameStore((state) => state.scene);
  const currentOrder = useGameStore((state) => state.currentOrder);
  const queue = useGameStore((state) => state.queue);
  const beginOrder = useGameStore((state) => state.beginOrder);
  const startTransition = useGameStore((state) => state.startTransition);
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const clock = useGameStore((state) => state.clock);
  const day = useGameStore((state) => state.day);
  const dayOver = useGameStore((state) => state.dayOver);
  const dayEarnings = useGameStore((state) => state.dayEarnings);
  const dayReviews = useGameStore((state) => state.dayReviews);
  const startNextDay = useGameStore((state) => state.startNextDay);

  const averageStars = dayReviews.length
    ? (dayReviews.reduce((sum, r) => sum + r.stars, 0) / dayReviews.length).toFixed(1)
    : '–';

  const orderLabel = currentOrder
    ? describeOrder(currentOrder)
    : queue.length > 0
      ? `${queue.length} pending`
      : 'Waiting for customers';

  const handlePick = (orderId: string) => {
    if (isTransitioning) {
      return;
    }
    startTransition(beginOrder(orderId));
  };

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
      {scene === 'orderBoard' && !currentOrder && !dayOver && (
        <OrderQueueOverlay orders={queue} onPick={handlePick} fontLoaded={fontsLoaded} />
      )}
      <View style={styles.clock} pointerEvents="none">
        {fontsLoaded && (
          <Text style={styles.hudText}>{`Day ${day} · ${formatClock(clock.minutes)}`}</Text>
        )}
      </View>
      {dayOver && (
        <View style={styles.summaryBackdrop}>
          <View style={styles.summaryCard}>
            {/* Never gate this on fontsLoaded: it's the only way to dismiss
                this blocking overlay, and the game must never get stuck. RN
                falls back to the system font if Figtree isn't ready yet. */}
            <Text style={styles.summaryTitle}>{`Day ${day} closed`}</Text>
            <Text style={styles.hudText}>{`Earned: $${dayEarnings}`}</Text>
            <Text style={styles.hudText}>{`Reviews: ${dayReviews.length} · avg ${averageStars}★`}</Text>
            <Pressable style={styles.summaryButton} onPress={startNextDay}>
              <Text style={styles.summaryButtonText}>Open next day</Text>
            </Pressable>
          </View>
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
  clock: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: `${NOGUEIRA}CC`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  summaryBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: NOGUEIRA,
    padding: 24,
    borderRadius: 12,
    gap: 8,
    alignItems: 'center',
  },
  summaryTitle: {
    color: CREME,
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 22,
  },
  summaryButton: {
    marginTop: 12,
    backgroundColor: '#F3B45A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  summaryButtonText: {
    color: NOGUEIRA,
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
  },
});
