"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import { RefObject, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type CameraControllerProps = {
target: RefObject<RapierRigidBody | null>;
yaw: React.MutableRefObject<number>;
};

export default function CameraController({
target,
yaw,
}: CameraControllerProps) {
const { camera, gl } = useThree();

const pitch = useRef(-0.18);

const currentPosition = useMemo(
() => new THREE.Vector3(),
[]
);

const desiredPosition = useMemo(
() => new THREE.Vector3(),
[]
);

const lookTarget = useMemo(
() => new THREE.Vector3(),
[]
);

const offset = useMemo(
() => new THREE.Vector3(),
[]
);

useEffect(() => {
const canvas = gl.domElement;

const handleClick = () => {
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (document.pointerLockElement !== canvas) return;

  const sensitivity = 0.0025;

  yaw.current -= event.movementX * sensitivity;

  pitch.current -= event.movementY * sensitivity;

  pitch.current = THREE.MathUtils.clamp(
    pitch.current,
    -0.85,
    0.45
  );
};

canvas.addEventListener("click", handleClick);
window.addEventListener("mousemove", handleMouseMove);

return () => {
  canvas.removeEventListener("click", handleClick);
  window.removeEventListener("mousemove", handleMouseMove);
};

}, [gl, yaw]);

useFrame((_, delta) => {
if (!target.current) return;

const player = target.current.translation();

const cameraDistance = 10.5;

const horizontalDistance =
  Math.cos(pitch.current) * cameraDistance;

const verticalDistance =
  Math.sin(pitch.current) * cameraDistance;

offset.set(
  Math.sin(yaw.current) * horizontalDistance,
  verticalDistance + 3.4,
  Math.cos(yaw.current) * horizontalDistance
);

desiredPosition.set(
  player.x + offset.x,
  player.y + offset.y,
  player.z + offset.z
);

const followSpeed =
  1 - Math.pow(0.001, delta);

currentPosition.lerp(
  desiredPosition,
  followSpeed
);

camera.position.copy(currentPosition);

lookTarget.set(
  player.x,
  player.y + 1.25,
  player.z
);

camera.lookAt(lookTarget);

});

return null;
}