import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useGameStore } from '../../state/gameStore';

const FADE_DURATION = 250;

/**
 * Full-screen black overlay that drives the hard-cut scene transition:
 * fade to black, swap the store's scene while fully opaque, fade back out.
 * No props — reads/writes the game store directly.
 */
export function FadeTransition() {
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const completeTransition = useGameStore((state) => state.completeTransition);
  const scene = useGameStore((state) => state.scene);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!isTransitioning) {
      return;
    }
    opacity.value = withTiming(1, { duration: FADE_DURATION }, (finished) => {
      if (finished) {
        runOnJS(completeTransition)();
      }
    });
  }, [isTransitioning, opacity, completeTransition]);

  // Fade back out only once the scene swap has actually committed on the JS
  // thread (this effect depends on `scene`, so it only runs after React has
  // re-rendered with the new mounted scene) — not merely after
  // completeTransition was scheduled from the fade-in's UI-thread callback,
  // which could land a frame early and pop the outgoing scene.
  useEffect(() => {
    opacity.value = withTiming(0, { duration: FADE_DURATION });
  }, [scene, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.overlay, animatedStyle]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'black',
  },
});
