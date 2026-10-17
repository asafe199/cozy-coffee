import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const FADE_IN_MS = 500;
const HOLD_MS = 4000;
const FADE_OUT_MS = 900;

/** Tip that fades in, stays a few seconds, then fades out; replays whenever `text` changes. */
export function HintBanner({ text }: { text: string }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withSequence(
      withTiming(1, { duration: FADE_IN_MS, easing: Easing.out(Easing.quad) }),
      withDelay(HOLD_MS, withTiming(0, { duration: FADE_OUT_MS }))
    );
  }, [text, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.hint, style]} pointerEvents="none">
      <Text style={styles.hintText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hint: {
    position: 'absolute',
    top: 64,
    left: 24,
    right: 24,
    alignItems: 'center',
    backgroundColor: '#4A2F1FCC',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  hintText: { color: '#F6E3C7', fontSize: 15, textAlign: 'center' },
});
