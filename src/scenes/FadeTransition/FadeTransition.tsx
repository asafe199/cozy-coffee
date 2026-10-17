import { useEffect } from 'react';
import { useGameStore } from '../../state/gameStore';

// Long enough for the camera glide (see CameraRig) to settle on the target scene.
const PAN_DURATION = 900;

/**
 * Drives scene changes: the camera glides to the pending scene (CameraRig reads
 * `pendingScene`), then the store's scene is committed once the pan has settled.
 * No props, renders nothing.
 */
export function FadeTransition() {
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const completeTransition = useGameStore((state) => state.completeTransition);

  useEffect(() => {
    if (!isTransitioning) {
      return;
    }
    const timer = setTimeout(completeTransition, PAN_DURATION);
    return () => clearTimeout(timer);
  }, [isTransitioning, completeTransition]);

  return null;
}
