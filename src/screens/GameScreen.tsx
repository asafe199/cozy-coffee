import React from 'react';
import { t, tf, orderWords } from '../i18n';
import { HintBanner } from './HintBanner';
import { useSettingsStore } from '../game/settings';
import { neighborScene } from '../game/navigation';
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
const AMBAR = '#F3B45A';
const CREME = '#F6E3C7';

/**
 * The app's single screen: the 3D canvas filling the screen, the fade-cut
 * overlay as a sibling on top of it, and a minimal HUD showing the most
 * recent review's star count. Font loading only gates the HUD text, not the
 * Canvas — the game is playable even before Figtree finishes loading.
 */
const HINTS = {
  orderBoard: 'hintOrderBoard',
  coffeeStation: 'hintCoffee',
  toastStation: 'hintToast',
  juiceStation: 'hintJuice',
  pancakeStation: 'hintPancakes',
  saladStation: 'hintSalad',
  deliveryCounter: 'hintDelivery',
} as const;

export function GameScreen({ onExit }: { onExit?: () => void }) {
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
  const level = useGameStore((state) => state.level);
  const day = useGameStore((state) => state.day);
  const dayOver = useGameStore((state) => state.dayOver);
  const dayEarnings = useGameStore((state) => state.dayEarnings);
  const dayReviews = useGameStore((state) => state.dayReviews);
  const startNextDay = useGameStore((state) => state.startNextDay);

  const averageStars = dayReviews.length
    ? (dayReviews.reduce((sum, r) => sum + r.stars, 0) / dayReviews.length).toFixed(1)
    : '–';

  const orderLabel = currentOrder
    ? describeOrder(currentOrder, orderWords())
    : queue.length > 0
      ? tf('hudPending', { n: queue.length })
      : t('hudWaiting');

  const hintsOn = useSettingsStore((state) => state.hints);
  const slide = (dir: -1 | 1) => {
    const target = neighborScene(scene, dir, level);
    if (target && !isTransitioning) {
      startTransition(target, dir);
    }
  };
  const showArrows = !dayOver;
  // Moving right from the board only makes sense once an order has been picked.
  const canGo = (dir: -1 | 1) =>
    !!neighborScene(scene, dir, level) && !(scene === 'orderBoard' && dir === 1 && !currentOrder);

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
        <Text style={styles.hudText}>
          {lastStars ? `${'★'.repeat(lastStars)}${'☆'.repeat(5 - lastStars)}` : t('hudNoReviews')}
        </Text>
      </View>
      {scene === 'orderBoard' && (
        <View style={styles.orderLabel} pointerEvents="none">
          <Text style={styles.orderLabelText}>{orderLabel}</Text>
        </View>
      )}
      {scene === 'orderBoard' && !currentOrder && !dayOver && (
        <OrderQueueOverlay orders={queue} onPick={handlePick} fontLoaded={fontsLoaded} />
      )}
      {hintsOn && !dayOver && <HintBanner text={t(HINTS[scene])} />}
      <View style={styles.clock} pointerEvents="none">
        <Text style={styles.hudText}>{`${tf('hudDay', { d: day })} · ${t('levelLabel')} ${level} · ${formatClock(clock.minutes)}`}</Text>
      </View>
      {showArrows && canGo(-1) && (
        <Pressable style={[styles.arrow, styles.arrowLeft]} onPress={() => slide(-1)} hitSlop={12}>
          <Text style={styles.arrowText}>◀</Text>
        </Pressable>
      )}
      {showArrows && canGo(1) && (
        <Pressable style={[styles.arrow, styles.arrowRight]} onPress={() => slide(1)} hitSlop={12}>
          <Text style={styles.arrowText}>▶</Text>
        </Pressable>
      )}
      {onExit && (
        <Pressable style={styles.menuButton} onPress={onExit}>
          <Text style={styles.hudText}>{t('gameMenu')}</Text>
        </Pressable>
      )}
      {dayOver && (
        <View style={styles.summaryBackdrop}>
          <View style={styles.summaryCard}>
            {/* Never gate this on fontsLoaded: it's the only way to dismiss
                this blocking overlay, and the game must never get stuck. RN
                falls back to the system font if Figtree isn't ready yet. */}
            <Text style={styles.summaryTitle}>{tf('dayClosed', { d: day })}</Text>
            <Text style={styles.hudText}>{tf('dayEarned', { v: dayEarnings })}</Text>
            <Text style={styles.hudText}>{tf('dayReviews', { n: dayReviews.length, avg: averageStars })}</Text>
            <Pressable style={styles.summaryButton} onPress={startNextDay}>
              <Text style={styles.summaryButtonText}>{t('nextDay')}</Text>
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
  arrow: {
    position: 'absolute',
    top: '45%',
    width: 48,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${NOGUEIRA}CC`,
    borderRadius: 12,
  },
  arrowLeft: { left: 8 },
  arrowRight: { right: 8 },
  arrowText: { color: AMBAR, fontSize: 22 },
  menuButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: `${NOGUEIRA}CC`,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
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
