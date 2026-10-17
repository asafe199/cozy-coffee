import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useGameStore } from '../../state/gameStore';

const FADE_DURATION = 250;
const SLIDE_DURATION = 320;

/**
 * Full-screen black overlay that drives the hard-cut scene transition:
 * fade to black, swap the store's scene while fully opaque, fade back out.
 * No props — reads/writes the game store directly.
 */
export function FadeTransition() {
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const completeTransition = useGameStore((state) => state.completeTransition);
  const scene = useGameStore((state) => state.scene);
  const transitionDir = useGameStore((state) => state.transitionDir);
  const opacity = useSharedValue(0);
  const tx = useSharedValue(0);
  // Direction of the last started transition, kept for the exit half after the store resets.
  const dirRef = React.useRef<-1 | 0 | 1>(0);

  useEffect(() => {
    if (!isTransitioning) {
      return;
    }
    dirRef.current = transitionDir;
    const done = (finished?: boolean) => {
      'worklet';
      if (finished) {
        runOnJS(completeTransition)();
      }
    };
    if (transitionDir === 0) {
      tx.value = 0;
      opacity.value = withTiming(1, { duration: FADE_DURATION }, done);
    } else {
      // Slide a panel across the screen in the direction of travel.
      tx.value = transitionDir * Dimensions.get('window').width;
      opacity.value = 1;
      tx.value = withTiming(0, { duration: SLIDE_DURATION }, done);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransitioning, opacity, completeTransition]);

  // Fade back out only once the scene swap has actually committed on the JS
  // thread (this effect depends on `scene`, so it only runs after React has
  // re-rendered with the new mounted scene) — not merely after
  // completeTransition was scheduled from the fade-in's UI-thread callback,
  // which could land a frame early and pop the outgoing scene.
  useEffect(() => {
    if (dirRef.current === 0) {
      opacity.value = withTiming(0, { duration: FADE_DURATION });
    } else {
      tx.value = withTiming(-dirRef.current * Dimensions.get('window').width, { duration: SLIDE_DURATION }, (finished) => {
        'worklet';
        if (finished) opacity.value = 0;
      });
    }
  }, [scene, opacity, tx]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: tx.value }],
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
  },
});
