"use client";

import * as THREE from "three";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { RefObject, useRef } from "react";

import PlayerController from "./PlayerController";
import CameraController from "./CameraController";

type PlayerProps = {
  playerRef: RefObject<RapierRigidBody | null>;
  driving: boolean;
};

export default function Player({
  playerRef,
  driving,
}: PlayerProps) {
  const modelRef =
    useRef<THREE.Group | null>(null);

  const headRef =
    useRef<THREE.Group | null>(null);

  const leftArmRef =
    useRef<THREE.Group | null>(null);

  const rightArmRef =
    useRef<THREE.Group | null>(null);

  const leftLegRef =
    useRef<THREE.Group | null>(null);

  const rightLegRef =
    useRef<THREE.Group | null>(null);

  const cameraYaw =
    useRef(0);

  return (
    <>
      <RigidBody
        ref={playerRef}
        position={[0, 0.95, 15]}
        enabledRotations={[
          false,
          false,
          false,
        ]}
        linearDamping={2}
        angularDamping={10}
        canSleep={false}
        type="dynamic"
      >
        <CapsuleCollider
          args={[0.55, 0.3]}
          position={[0, 0.9, 0]}
        />

        <group
          ref={modelRef}
          visible={!driving}
        >
          {/* TORSO */}

          <mesh
            position={[0, 1.08, 0]}
            castShadow
          >
            <capsuleGeometry
              args={[0.38, 0.62, 8, 16]}
            />

            <meshStandardMaterial
              color="#f97316"
              roughness={0.85}
            />
          </mesh>

          {/* SHIRT LOWER SECTION */}

          <mesh
            position={[0, 0.88, 0]}
            castShadow
          >
            <boxGeometry
              args={[0.58, 0.38, 0.34]}
            />

            <meshStandardMaterial
              color="#f97316"
              roughness={0.85}
            />
          </mesh>

          {/* COLLAR */}

          <mesh
            position={[0, 1.43, 0]}
          >
            <torusGeometry
              args={[
                0.14,
                0.035,
                8,
                16,
              ]}
            />

            <meshStandardMaterial
              color="#d85d08"
              roughness={0.8}
            />
          </mesh>

          {/* NECK */}

          <mesh
            position={[0, 1.55, 0]}
            castShadow
          >
            <cylinderGeometry
              args={[
                0.115,
                0.13,
                0.22,
                16,
              ]}
            />

            <meshStandardMaterial
              color="#75462b"
              roughness={0.9}
            />
          </mesh>

          {/* HEAD */}

          <group
            ref={headRef}
            position={[0, 1.83, 0]}
          >
            {/* Face */}

            <mesh castShadow>
              <sphereGeometry
                args={[0.29, 32, 24]}
              />

              <meshStandardMaterial
                color="#75462b"
                roughness={0.82}
              />
            </mesh>

            {/* Hair */}

            <mesh
              position={[0, 0.14, -0.025]}
              scale={[
                1.04,
                0.68,
                1.02,
              ]}
              castShadow
            >
              <sphereGeometry
                args={[0.3, 28, 20]}
              />

              <meshStandardMaterial
                color="#120e0c"
                roughness={0.95}
              />
            </mesh>

            {/* Front hair */}

            <mesh
              position={[0, 0.18, 0.17]}
              scale={[1, 0.55, 0.45]}
            >
              <sphereGeometry
                args={[0.22, 20, 14]}
              />

              <meshStandardMaterial
                color="#120e0c"
                roughness={1}
              />
            </mesh>

            {/* Left eye */}

            <mesh
              position={[
                -0.105,
                0.025,
                0.27,
              ]}
            >
              <sphereGeometry
                args={[0.035, 12, 12]}
              />

              <meshStandardMaterial
                color="#151515"
              />
            </mesh>

            {/* Right eye */}

            <mesh
              position={[
                0.105,
                0.025,
                0.27,
              ]}
            >
              <sphereGeometry
                args={[0.035, 12, 12]}
              />

              <meshStandardMaterial
                color="#151515"
              />
            </mesh>

            {/* Nose */}

            <mesh
              position={[
                0,
                -0.035,
                0.295,
              ]}
              rotation={[
                Math.PI / 2,
                0,
                0,
              ]}
            >
              <coneGeometry
                args={[0.045, 0.12, 8]}
              />

              <meshStandardMaterial
                color="#704126"
                roughness={0.9}
              />
            </mesh>

            {/* Mouth */}

            <mesh
              position={[
                0,
                -0.115,
                0.278,
              ]}
              scale={[
                0.7,
                0.35,
                0.3,
              ]}
            >
              <sphereGeometry
                args={[0.055, 12, 8]}
              />

              <meshStandardMaterial
                color="#3a1714"
                roughness={0.8}
              />
            </mesh>
          </group>

          {/* LEFT ARM */}

          <group
            ref={leftArmRef}
            position={[-0.46, 1.25, 0]}
          >
            <mesh
              position={[0, -0.23, 0]}
              castShadow
            >
              <capsuleGeometry
                args={[0.105, 0.38, 8, 12]}
              />

              <meshStandardMaterial
                color="#75462b"
                roughness={0.9}
              />
            </mesh>

            <mesh
              position={[0, -0.53, 0]}
              castShadow
            >
              <capsuleGeometry
                args={[0.09, 0.28, 8, 12]}
              />

              <meshStandardMaterial
                color="#75462b"
                roughness={0.9}
              />
            </mesh>

            <mesh
              position={[0, -0.77, 0]}
              castShadow
            >
              <sphereGeometry
                args={[0.105, 16, 16]}
              />

              <meshStandardMaterial
                color="#75462b"
                roughness={0.9}
              />
            </mesh>
          </group>

          {/* RIGHT ARM */}

          <group
            ref={rightArmRef}
            position={[0.46, 1.25, 0]}
          >
            <mesh
              position={[0, -0.23, 0]}
              castShadow
            >
              <capsuleGeometry
                args={[0.105, 0.38, 8, 12]}
              />

              <meshStandardMaterial
                color="#75462b"
                roughness={0.9}
              />
            </mesh>

            <mesh
              position={[0, -0.53, 0]}
              castShadow
            >
              <capsuleGeometry
                args={[0.09, 0.28, 8, 12]}
              />

              <meshStandardMaterial
                color="#75462b"
                roughness={0.9}
              />
            </mesh>

            <mesh
              position={[0, -0.77, 0]}
              castShadow
            >
              <sphereGeometry
                args={[0.105, 16, 16]}
              />

              <meshStandardMaterial
                color="#75462b"
                roughness={0.9}
              />
            </mesh>
          </group>

          {/* HIPS */}

          <mesh
            position={[0, 0.68, 0]}
            castShadow
          >
            <boxGeometry
              args={[0.56, 0.35, 0.34]}
            />

            <meshStandardMaterial
              color="#202020"
              roughness={0.9}
            />
          </mesh>

          {/* LEFT LEG */}

          <group
            ref={leftLegRef}
            position={[-0.18, 0.58, 0]}
          >
            <mesh
              position={[0, -0.22, 0]}
              castShadow
            >
              <capsuleGeometry
                args={[0.135, 0.38, 8, 12]}
              />

              <meshStandardMaterial
                color="#242424"
                roughness={0.88}
              />
            </mesh>

            <mesh
              position={[0, -0.54, 0]}
              castShadow
            >
              <capsuleGeometry
                args={[0.11, 0.3, 8, 12]}
              />

              <meshStandardMaterial
                color="#242424"
                roughness={0.88}
              />
            </mesh>

            <mesh
              position={[0, -0.79, -0.08]}
              castShadow
            >
              <boxGeometry
                args={[
                  0.25,
                  0.15,
                  0.48,
                ]}
              />

              <meshStandardMaterial
                color="#101010"
                roughness={0.8}
              />
            </mesh>
          </group>

          {/* RIGHT LEG */}

          <group
            ref={rightLegRef}
            position={[0.18, 0.58, 0]}
          >
            <mesh
              position={[0, -0.22, 0]}
              castShadow
            >
              <capsuleGeometry
                args={[0.135, 0.38, 8, 12]}
              />

              <meshStandardMaterial
                color="#242424"
                roughness={0.88}
              />
            </mesh>

            <mesh
              position={[0, -0.54, 0]}
              castShadow
            >
              <capsuleGeometry
                args={[0.11, 0.3, 8, 12]}
              />

              <meshStandardMaterial
                color="#242424"
                roughness={0.88}
              />
            </mesh>

            <mesh
              position={[0, -0.79, -0.08]}
              castShadow
            >
              <boxGeometry
                args={[
                  0.25,
                  0.15,
                  0.48,
                ]}
              />

              <meshStandardMaterial
                color="#101010"
                roughness={0.8}
              />
            </mesh>
          </group>
        </group>

        {!driving && (
          <PlayerController
            bodyRef={playerRef}
            modelRef={modelRef}
            leftArmRef={leftArmRef}
            rightArmRef={rightArmRef}
            leftLegRef={leftLegRef}
            rightLegRef={rightLegRef}
            cameraYaw={cameraYaw}
          />
        )}
      </RigidBody>

      <CameraController
        target={playerRef}
        yaw={cameraYaw}
      />
    </>
  );
}