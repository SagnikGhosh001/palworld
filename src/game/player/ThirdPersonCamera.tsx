import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { inputManager } from './InputManager';
import { playerController } from './PlayerController';
import { usePlayerStore } from './usePlayerStore';

export function ThirdPersonCamera() {
  const { camera } = useThree();

  // Spherical camera orbit state
  const yaw = useRef(0); // radians around Y
  const pitch = useRef(0.35); // radians above horizon
  const distance = useRef(5.5); // meters behind player
  const currentLookAt = useRef(new THREE.Vector3(0, 1.2, 0));
  const currentCamPos = useRef(new THREE.Vector3(0, 2.5, 6));

  useFrame((_, delta) => {
    // 1. Process mouse look input
    const mouseDelta = inputManager.consumeMouseDelta();
    if (mouseDelta.x !== 0 || mouseDelta.y !== 0) {
      const sensitivity = 0.003;
      yaw.current -= mouseDelta.x * sensitivity;
      pitch.current -= mouseDelta.y * sensitivity;

      // Clamp vertical pitch to prevent flipping
      pitch.current = Math.max(-0.15, Math.min(Math.PI / 2.3, pitch.current));

      // Notify kinematics of new camera yaw
      playerController.setCameraYaw(yaw.current);
    }

    // 2. Compute desired target look-at point directly from player store
    const playerPos = usePlayerStore.getState().position;
    const targetLookAt = new THREE.Vector3(
      playerPos[0],
      playerPos[1] + 1.2,
      playerPos[2]
    );

    // Smoothly lag lookAt position
    currentLookAt.current.lerp(targetLookAt, Math.min(1, delta * 12));

    // 3. Compute spherical offset relative to look-at point
    const horizDist = distance.current * Math.cos(pitch.current);
    const vertDist = distance.current * Math.sin(pitch.current);

    const offsetX = horizDist * Math.sin(yaw.current);
    const offsetZ = horizDist * Math.cos(yaw.current);
    const offsetY = vertDist;

    const desiredCamPos = new THREE.Vector3(
      currentLookAt.current.x + offsetX,
      Math.max(0.6, currentLookAt.current.y + offsetY), // Prevent camera going below ground
      currentLookAt.current.z + offsetZ
    );

    // Smooth camera position interpolation
    currentCamPos.current.lerp(desiredCamPos, Math.min(1, delta * 14));

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
