"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import type { Group } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

type GlbCharacterProps = {
  animationSpeed?: number;
  isMoving?: boolean;
  positionY?: number;
  rotationOffset?: number;
  scale?: number;
  src: string;
};

export function GlbCharacter({
  animationSpeed = 1,
  isMoving = true,
  positionY = 0,
  rotationOffset = 0,
  scale = 1,
  src
}: GlbCharacterProps) {
  const groupRef = useRef<Group>(null);
  const gltf = useGLTF(src);
  const scene = useMemo(() => clone(gltf.scene), [gltf.scene]);
  const { actions, names } = useAnimations(gltf.animations, groupRef);
  const actionName = useMemo(
    () =>
      names.find((name) => /walk|run/i.test(name)) ??
      names.find((name) => !/idle|pose/i.test(name)) ??
      names[0],
    [names]
  );

  useEffect(() => {
    scene.traverse((object) => {
      object.castShadow = true;
      object.receiveShadow = true;
    });
  }, [scene]);

  useEffect(() => {
    const action = actionName ? actions[actionName] : undefined;

    if (!action) {
      return;
    }

    action.reset().fadeIn(0.2).play();

    return () => {
      action.fadeOut(0.2);
    };
  }, [actionName, actions]);

  useEffect(() => {
    const action = actionName ? actions[actionName] : undefined;

    if (!action) {
      return;
    }

    action.paused = !isMoving;
    action.timeScale = isMoving ? animationSpeed : 0;
  }, [actionName, actions, animationSpeed, isMoving]);

  return (
    <group ref={groupRef} position={[0, positionY, 0]} rotation={[0, rotationOffset, 0]} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/assets/characters/cesium-man.glb");
useGLTF.preload("/assets/characters/quaternius-adventurer.glb");
useGLTF.preload("/assets/characters/quaternius-king.glb");
useGLTF.preload("/assets/characters/quaternius-farmer.glb");
useGLTF.preload("/assets/characters/quaternius-hoodie.glb");
