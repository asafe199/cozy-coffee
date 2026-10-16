import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Points the shared default camera at a scene-specific spot. Each of the
 * three scene groups (OrderBoard/CoffeeStation/DeliveryCounter) calls this
 * once on mount with its own framing; since GameScene renders only one of
 * them at a time, there is never a conflict between two scenes' setups.
 * useLayoutEffect (not useEffect) so the camera is repositioned before the
 * first paint of a freshly-mounted scene.
 */
export function useSceneCamera(
  position: [number, number, number],
  lookAt: [number, number, number]
) {
  const camera = useThree((state) => state.camera);
  useLayoutEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
    // Deliberately mount-only: position/lookAt are passed as fresh literals
    // by callers each render, but re-running this is only ever needed once
    // per scene mount (the scene remounts fresh on every re-entry anyway).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);
}
