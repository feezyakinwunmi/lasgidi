"use client";

import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { RapierRigidBody } from "@react-three/rapier";
import {
  MutableRefObject,
  RefObject,
  useRef,
} from "react";
import * as THREE from "three";

type PlayerControllerProps = {
  bodyRef: RefObject<RapierRigidBody | null>;
  modelRef: RefObject<THREE.Group | null>;
  leftArmRef: RefObject<THREE.Group | null>;
  rightArmRef: RefObject<THREE.Group | null>;
  leftLegRef: RefObject<THREE.Group | null>;
  rightLegRef: RefObject<THREE.Group | null>;
  cameraYaw: MutableRefObject<number>;
};

export default function PlayerController({
  bodyRef,
  modelRef,
  leftArmRef,
  rightArmRef,
  leftLegRef,
  rightLegRef,
  cameraYaw,
}: PlayerControllerProps) {
  const [, getKeys] =
    useKeyboardControls();

  const direction =
    useRef(new THREE.Vector3());

  const cameraForward =
    useRef(new THREE.Vector3());

  const cameraRight =
    useRef(new THREE.Vector3());

  const walkTime =
    useRef(0);

  const idleTime =
    useRef(0);

  useFrame((_, delta) => {
    const body = bodyRef.current;

    if (!body) return;

    const keys = getKeys();

    let x = 0;
    let z = 0;

    if (keys.forward) z -= 1;
    if (keys.backward) z += 1;
    if (keys.left) x -= 1;
    if (keys.right) x += 1;

    const moving =
      x !== 0 || z !== 0;

    const currentPosition =
      body.translation();

    if (moving) {
      const length =
        Math.sqrt(
          x * x + z * z
        );

      x /= length;
      z /= length;

      cameraForward.current.set(
        Math.sin(cameraYaw.current),
        0,
        -Math.cos(cameraYaw.current)
      );

      cameraRight.current.set(
        Math.cos(cameraYaw.current),
        0,
        Math.sin(cameraYaw.current)
      );

      direction.current
        .set(0, 0, 0)
        .addScaledVector(
          cameraForward.current,
          -z
        )
        .addScaledVector(
          cameraRight.current,
          x
        )
        .normalize();

      const speed =
        keys.sprint ? 7.5 : 4.5;

      body.setTranslation(
        {
          x:
            currentPosition.x +
            direction.current.x *
              speed *
              delta,

          y:
            currentPosition.y,

          z:
            currentPosition.z +
            direction.current.z *
              speed *
              delta,
        },
        true
      );

      body.wakeUp();

      if (modelRef.current) {
        const targetRotation =
          Math.atan2(
            direction.current.x,
            direction.current.z
          );

        let difference =
          targetRotation -
          modelRef.current.rotation.y;

        difference = Math.atan2(
          Math.sin(difference),
          Math.cos(difference)
        );

        modelRef.current.rotation.y +=
          difference *
          Math.min(delta * 12, 1);

        modelRef.current.position.y = 0;
      }

      walkTime.current +=
        delta *
        (keys.sprint ? 15 : 10);

      const swing =
        Math.sin(
          walkTime.current
        ) *
        (keys.sprint
          ? 0.72
          : 0.5);

      const armTilt =
        Math.cos(
          walkTime.current
        ) *
        (keys.sprint
          ? 0.16
          : 0.1);

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x =
          swing;

        leftArmRef.current.rotation.z =
          armTilt;
      }

      if (rightArmRef.current) {
        rightArmRef.current.rotation.x =
          -swing;

        rightArmRef.current.rotation.z =
          -armTilt;
      }

      if (leftLegRef.current) {
        leftLegRef.current.rotation.x =
          -swing;
      }

      if (rightLegRef.current) {
        rightLegRef.current.rotation.x =
          swing;
      }

      idleTime.current = 0;
    } else {
      idleTime.current +=
        delta * 2;

      if (modelRef.current) {
        modelRef.current.position.y =
          Math.sin(
            idleTime.current
          ) * 0.015;
      }

      const returnSpeed =
        Math.min(
          delta * 9,
          1
        );

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x =
          THREE.MathUtils.lerp(
            leftArmRef.current.rotation.x,
            0,
            returnSpeed
          );

        leftArmRef.current.rotation.z =
          THREE.MathUtils.lerp(
            leftArmRef.current.rotation.z,
            0,
            returnSpeed
          );
      }

      if (rightArmRef.current) {
        rightArmRef.current.rotation.x =
          THREE.MathUtils.lerp(
            rightArmRef.current.rotation.x,
            0,
            returnSpeed
          );

        rightArmRef.current.rotation.z =
          THREE.MathUtils.lerp(
            rightArmRef.current.rotation.z,
            0,
            returnSpeed
          );
      }

      if (leftLegRef.current) {
        leftLegRef.current.rotation.x =
          THREE.MathUtils.lerp(
            leftLegRef.current.rotation.x,
            0,
            returnSpeed
          );
      }

      if (rightLegRef.current) {
        rightLegRef.current.rotation.x =
          THREE.MathUtils.lerp(
            rightLegRef.current.rotation.x,
            0,
            returnSpeed
          );
      }
    }
  });

  return null;
}