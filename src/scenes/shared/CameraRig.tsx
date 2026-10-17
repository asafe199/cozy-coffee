import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SceneId } from '../../game/types';
import { cameraPose } from './world';

/** Smoothly glides the camera (position and look-at) toward the target scene's pose. */
export function CameraRig({ target }: { target: SceneId }) {
  const look = useRef<THREE.Vector3 | null>(null);
  useFrame((state, delta) => {
    const pose = cameraPose(target);
    const goal = new THREE.Vector3(...pose.position);
    const goalLook = new THREE.Vector3(...pose.lookAt);
    if (!look.current) {
      // First frame: snap, so the game doesn't open with a pan from the origin.
      look.current = goalLook.clone();
      state.camera.position.copy(goal);
    }
    const k = 1 - Math.exp(-delta * 4);
    state.camera.position.lerp(goal, k);
    look.current.lerp(goalLook, k);
    state.camera.lookAt(look.current);
  });
  return null;
}
