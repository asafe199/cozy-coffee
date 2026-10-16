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
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!isTransitioning) {
      return;
    }
    opacity.value = withTiming(1, { duration: FADE_DURATION }, (finished) => {
      if (finished) {
        runOnJS(completeTransition)();
        opacity.value = withTiming(0, { duration: FADE_DURATION });
      }
    });
  }, [isTransitioning, opacity, completeTransition]);

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
