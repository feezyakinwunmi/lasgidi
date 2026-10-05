"use client";

import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

import FallbackPlayer from "./FallbackPlayer";

interface Props {
  modelRef: React.RefObject<THREE.Group | null>;
  velocityRef?: React.MutableRefObject<THREE.Vector3>;
}

export default function PlayerModel({ modelRef, velocityRef }: Props) {
  const innerRef = useRef<THREE.Group>(null);

  // Subtle procedural bob so the placeholder still feels alive
  useFrame(({ clock }) => {
    if (!innerRef.current) return;
    const t = clock.getElapsedTime();
    const speed = velocityRef?.current?.length() ?? 0;
    if (speed < 0.3) {
      innerRef.current.position.y = Math.sin(t * 1.8) * 0.008;
    } else {
      innerRef.current.position.y = Math.abs(Math.sin(t * 8)) * 0.03;
    }
  });

  return (
    <group ref={innerRef}>
      <FallbackPlayer modelRef={modelRef} />
    </group>
  );
}