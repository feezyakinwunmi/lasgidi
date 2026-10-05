import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import type { MutableRefObject, RefObject } from "react";
import * as THREE from "three";

type VehicleProps = {
  playerRef?: RefObject<RapierRigidBody | null>;
  drivingRef?: MutableRefObject<boolean>;
  onEnter: () => void;
  onExit: () => void;
};

type WheelProps = {
  position: [number, number, number];
  steeringRef?: React.MutableRefObject<THREE.Group | null>;
  spinningRef?: React.MutableRefObject<THREE.Group | null>;
};

const Wheel = React.forwardRef<THREE.Group, WheelProps>(
  ({ position, steeringRef, spinningRef }, ref) => {
    const internalSteering = useRef<THREE.Group | null>(null);
    const internalSpinning = useRef<THREE.Group | null>(null);

    React.useImperativeHandle(
      ref,
      () => internalSteering.current as THREE.Group
    );

    React.useEffect(() => {
      if (steeringRef) {
        steeringRef.current = internalSteering.current;
      }

      if (spinningRef) {
        spinningRef.current = internalSpinning.current;
      }

      return () => {
        if (steeringRef) steeringRef.current = null;
        if (spinningRef) spinningRef.current = null;
      };
    }, [steeringRef, spinningRef]);

    return (
      <group
        ref={internalSteering}
        position={position}
      >
        <group ref={internalSpinning}>
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[0.49, 0.49, 0.4, 24]} />
            <meshStandardMaterial
              color="#111111"
              roughness={0.82}
              metalness={0.08}
            />
          </mesh>

          <mesh
            position={[-0.21, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.29, 0.29, 0.025, 24]} />
            <meshStandardMaterial
              color="#c7c7c7"
              roughness={0.25}
              metalness={0.9}
            />
          </mesh>

          <mesh
            position={[-0.225, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.18, 0.18, 0.035, 24]} />
            <meshStandardMaterial
              color="#222222"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>

          <mesh
            position={[-0.245, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.095, 0.095, 0.045, 20]} />
            <meshStandardMaterial
              color="#d9d9d9"
              roughness={0.2}
              metalness={0.95}
            />
          </mesh>

          {[0, 1, 2, 3, 4].map((index) => {
            const angle = (index / 5) * Math.PI * 2;

            return (
              <mesh
                key={index}
                position={[
                  -0.25,
                  Math.cos(angle) * 0.15,
                  Math.sin(angle) * 0.15,
                ]}
                rotation={[0, angle, Math.PI / 2]}
              >
                <boxGeometry args={[0.025, 0.25, 0.035]} />
                <meshStandardMaterial
                  color="#bdbdbd"
                  roughness={0.22}
                  metalness={0.9}
                />
              </mesh>
            );
          })}

          <mesh
            position={[-0.27, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.14, 0.14, 0.025, 24]} />
            <meshStandardMaterial
              color="#555555"
              roughness={0.5}
              metalness={0.7}
            />
          </mesh>

          <mesh
            position={[-0.29, 0.18, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <boxGeometry args={[0.08, 0.035, 0.12]} />
            <meshStandardMaterial
              color="#5c1010"
              roughness={0.45}
              metalness={0.3}
            />
          </mesh>
        </group>
      </group>
    );
  }
);

Wheel.displayName = "Wheel";

export default function Vehicle({
  playerRef,
  drivingRef,
  onEnter,
  onExit,
}: VehicleProps) {
  const vehicleRef = useRef<RapierRigidBody | null>(null);

  const fallbackDrivingRef = useRef(false);
  const actualDrivingRef = drivingRef ?? fallbackDrivingRef;

  const [, getKeys] = useKeyboardControls();

  const speedRef = useRef(0);
  const previousEnter = useRef(false);
  const steeringRef = useRef(0);

  const frontLeftSteering = useRef<THREE.Group | null>(null);
  const frontRightSteering = useRef<THREE.Group | null>(null);

  const frontLeftSpinning = useRef<THREE.Group | null>(null);
  const frontRightSpinning = useRef<THREE.Group | null>(null);
  const rearLeftSpinning = useRef<THREE.Group | null>(null);
  const rearRightSpinning = useRef<THREE.Group | null>(null);

  useFrame((_, delta) => {
    const vehicle = vehicleRef.current;

    if (!vehicle) return;

    const keys = getKeys();

    const enterPressed = keys.enter;
    const justPressedEnter =
      enterPressed && !previousEnter.current;

    const translation = vehicle.translation();
    const player = playerRef?.current;

    if (justPressedEnter) {
      if (!actualDrivingRef.current) {
        if (player) {
          const playerPosition = player.translation();

          const dx = playerPosition.x - translation.x;
          const dz = playerPosition.z - translation.z;

          const distance = Math.sqrt(dx * dx + dz * dz);

          if (distance < 4) {
            actualDrivingRef.current = true;

            player.setTranslation(
              {
                x: translation.x,
                y: translation.y + 0.65,
                z: translation.z,
              },
              true
            );

            player.setLinvel(
              {
                x: 0,
                y: 0,
                z: 0,
              },
              true
            );

            speedRef.current = 0;

            onEnter();
          }
        }
      } else {
        const exitOffset = new THREE.Vector3(
          2.4,
          0.4,
          0
        );

        const rotation = vehicle.rotation();

        const quaternion = new THREE.Quaternion(
          rotation.x,
          rotation.y,
          rotation.z,
          rotation.w
        );

        exitOffset.applyQuaternion(quaternion);

        if (player) {
          player.setTranslation(
            {
              x: translation.x + exitOffset.x,
              y: translation.y + exitOffset.y,
              z: translation.z + exitOffset.z,
            },
            true
          );

          player.setLinvel(
            {
              x: 0,
              y: 0,
              z: 0,
            },
            true
          );
        }

        actualDrivingRef.current = false;
        speedRef.current = 0;

        onExit();
      }
    }

    previousEnter.current = enterPressed;

    if (!actualDrivingRef.current) {
      speedRef.current = THREE.MathUtils.lerp(
        speedRef.current,
        0,
        Math.min(delta * 5, 1)
      );

      steeringRef.current = THREE.MathUtils.lerp(
        steeringRef.current,
        0,
        Math.min(delta * 8, 1)
      );

      if (frontLeftSteering.current) {
        frontLeftSteering.current.rotation.y =
          THREE.MathUtils.lerp(
            frontLeftSteering.current.rotation.y,
            0,
            Math.min(delta * 8, 1)
          );
      }

      if (frontRightSteering.current) {
        frontRightSteering.current.rotation.y =
          THREE.MathUtils.lerp(
            frontRightSteering.current.rotation.y,
            0,
            Math.min(delta * 8, 1)
          );
      }

      return;
    }

    const accelerating = keys.forward;
    const reversing = keys.backward;
    const sprinting = keys.sprint;

    let targetSpeed = 0;

    if (accelerating) {
      targetSpeed = sprinting ? 20 : 12;
    } else if (reversing) {
      targetSpeed = -6;
    }

    speedRef.current = THREE.MathUtils.lerp(
      speedRef.current,
      targetSpeed,
      Math.min(delta * 3.5, 1)
    );

    const steeringInput = keys.left
      ? 1
      : keys.right
        ? -1
        : 0;

    steeringRef.current = THREE.MathUtils.lerp(
      steeringRef.current,
      steeringInput,
      Math.min(delta * 8, 1)
    );

    const speed = speedRef.current;

    if (Math.abs(speed) > 0.15) {
      const steeringStrength =
        1.7 * Math.min(Math.abs(speed) / 6, 1);

      const reverseMultiplier = speed < 0 ? -1 : 1;

      const yaw =
        steeringRef.current *
        steeringStrength *
        delta *
        reverseMultiplier;

      const currentRotation = vehicle.rotation();

      const quaternion = new THREE.Quaternion(
        currentRotation.x,
        currentRotation.y,
        currentRotation.z,
        currentRotation.w
      );

      const yawQuaternion =
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          yaw
        );

      quaternion.multiply(yawQuaternion);

      vehicle.setNextKinematicRotation({
        x: quaternion.x,
        y: quaternion.y,
        z: quaternion.z,
        w: quaternion.w,
      });
    }

    const rotation = vehicle.rotation();

    const quaternion = new THREE.Quaternion(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );

    const forward = new THREE.Vector3(0, 0, -1);

    forward.applyQuaternion(quaternion);

    const movement = forward.multiplyScalar(
      speed * delta
    );

    vehicle.setNextKinematicTranslation({
      x: translation.x + movement.x,
      y: 0.08,
      z: translation.z + movement.z,
    });

    if (player) {
      player.setTranslation(
        {
          x: translation.x,
          y: translation.y + 0.65,
          z: translation.z,
        },
        true
      );

      player.setLinvel(
        {
          x: movement.x / Math.max(delta, 0.001),
          y: 0,
          z: movement.z / Math.max(delta, 0.001),
        },
        true
      );
    }

    const wheelSpin = speed * delta * 2.8;

    frontLeftSpinning.current?.rotateX(wheelSpin);
    frontRightSpinning.current?.rotateX(wheelSpin);
    rearLeftSpinning.current?.rotateX(wheelSpin);
    rearRightSpinning.current?.rotateX(wheelSpin);

    const steeringAngle =
      steeringRef.current *
      0.38 *
      Math.min(Math.abs(speed) / 6, 1);

    if (frontLeftSteering.current) {
      frontLeftSteering.current.rotation.y =
        THREE.MathUtils.lerp(
          frontLeftSteering.current.rotation.y,
          steeringAngle,
          Math.min(delta * 10, 1)
        );
    }

    if (frontRightSteering.current) {
      frontRightSteering.current.rotation.y =
        THREE.MathUtils.lerp(
          frontRightSteering.current.rotation.y,
          steeringAngle,
          Math.min(delta * 10, 1)
        );
    }
  });

  return (
    <RigidBody
      ref={vehicleRef}
      type="kinematicPosition"
      position={[0, 0.08, 8]}
      enabledRotations={[false, true, false]}
      canSleep={false}
      colliders={false}
    >
      <CuboidCollider
        args={[1.2, 0.45, 2.2]}
        position={[0, 0.45, 0]}
      />

      <group>
        <mesh
          position={[0, 0.75, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.45, 0.62, 4.35]} />
          <meshStandardMaterial
            color="#202020"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>

        <mesh position={[0, 0.52, 0]} castShadow>
          <boxGeometry args={[2.52, 0.22, 4.15]} />
          <meshStandardMaterial
            color="#111111"
            roughness={0.35}
            metalness={0.65}
          />
        </mesh>

        <mesh
          position={[0, 1.08, -1.48]}
          castShadow
        >
          <boxGeometry args={[2.32, 0.2, 1.18]} />
          <meshStandardMaterial
            color="#242424"
            roughness={0.28}
            metalness={0.7}
          />
        </mesh>

        <mesh
          position={[0, 0.72, -2.24]}
          castShadow
        >
          <boxGeometry args={[2.48, 0.28, 0.18]} />
          <meshStandardMaterial
            color="#090909"
            roughness={0.3}
            metalness={0.65}
          />
        </mesh>

        <mesh
          position={[0, 0.72, 2.24]}
          castShadow
        >
          <boxGeometry args={[2.48, 0.28, 0.18]} />
          <meshStandardMaterial
            color="#090909"
            roughness={0.3}
            metalness={0.65}
          />
        </mesh>

        <mesh
          position={[0, 1.55, 0.32]}
          castShadow
        >
          <boxGeometry args={[2.12, 0.85, 2.25]} />
          <meshStandardMaterial
            color="#171717"
            roughness={0.3}
            metalness={0.65}
          />
        </mesh>

        <mesh
          position={[0, 2.02, 0.3]}
          castShadow
        >
          <boxGeometry args={[2.02, 0.12, 2.08]} />
          <meshStandardMaterial
            color="#151515"
            roughness={0.25}
            metalness={0.75}
          />
        </mesh>

        <mesh
          position={[0, 1.61, -0.84]}
          rotation={[0.05, 0, 0]}
        >
          <boxGeometry args={[1.82, 0.52, 0.035]} />
          <meshStandardMaterial
            color="#101820"
            roughness={0.08}
            metalness={0.3}
            transparent
            opacity={0.72}
          />
        </mesh>

        <mesh position={[0, 1.61, 1.48]}>
          <boxGeometry args={[1.82, 0.52, 0.035]} />
          <meshStandardMaterial
            color="#101820"
            roughness={0.08}
            metalness={0.3}
            transparent
            opacity={0.72}
          />
        </mesh>

        <mesh position={[-1.08, 1.58, 0.3]}>
          <boxGeometry args={[0.035, 0.5, 1.55]} />
          <meshStandardMaterial
            color="#111820"
            roughness={0.08}
            metalness={0.25}
            transparent
            opacity={0.72}
          />
        </mesh>

        <mesh position={[1.08, 1.58, 0.3]}>
          <boxGeometry args={[0.035, 0.5, 1.55]} />
          <meshStandardMaterial
            color="#111820"
            roughness={0.08}
            metalness={0.25}
            transparent
            opacity={0.72}
          />
        </mesh>

        <mesh
          position={[0, 0.95, -2.34]}
        >
          <boxGeometry args={[1.35, 0.24, 0.08]} />
          <meshStandardMaterial
            color="#080808"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>

        {[-0.48, -0.16, 0.16, 0.48].map((x) => (
          <mesh
            key={x}
            position={[x, 0.95, -2.39]}
          >
            <boxGeometry args={[0.06, 0.18, 0.04]} />
            <meshStandardMaterial
              color="#555555"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
        ))}

        <mesh
          position={[-0.82, 1.05, -2.18]}
        >
          <boxGeometry args={[0.38, 0.22, 0.08]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1.8}
          />
        </mesh>

        <mesh
          position={[0.82, 1.05, -2.18]}
        >
          <boxGeometry args={[0.38, 0.22, 0.08]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1.8}
          />
        </mesh>

        <mesh
          position={[-0.84, 1.02, 2.18]}
        >
          <boxGeometry args={[0.38, 0.2, 0.08]} />
          <meshStandardMaterial
            color="#b00000"
            emissive="#b00000"
            emissiveIntensity={1.3}
          />
        </mesh>

        <mesh
          position={[0.84, 1.02, 2.18]}
        >
          <boxGeometry args={[0.38, 0.2, 0.08]} />
          <meshStandardMaterial
            color="#b00000"
            emissive="#b00000"
            emissiveIntensity={1.3}
          />
        </mesh>

        <mesh
          position={[-1.28, 0.65, 0]}
          castShadow
        >
          <boxGeometry args={[0.18, 0.25, 2.4]} />
          <meshStandardMaterial
            color="#111111"
            roughness={0.35}
            metalness={0.6}
          />
        </mesh>

        <mesh
          position={[1.28, 0.65, 0]}
          castShadow
        >
          <boxGeometry args={[0.18, 0.25, 2.4]} />
          <meshStandardMaterial
            color="#111111"
            roughness={0.35}
            metalness={0.6}
          />
        </mesh>

        <mesh
          position={[-1.09, 1.55, -0.05]}
        >
          <boxGeometry args={[0.05, 0.09, 0.38]} />
          <meshStandardMaterial
            color="#050505"
            roughness={0.25}
            metalness={0.8}
          />
        </mesh>

        <mesh
          position={[1.09, 1.55, -0.05]}
        >
          <boxGeometry args={[0.05, 0.09, 0.38]} />
          <meshStandardMaterial
            color="#050505"
            roughness={0.25}
            metalness={0.8}
          />
        </mesh>

        <mesh
          position={[-1.16, 1.74, -0.45]}
        >
          <boxGeometry args={[0.18, 0.12, 0.42]} />
          <meshStandardMaterial
            color="#111111"
            roughness={0.25}
            metalness={0.75}
          />
        </mesh>

        <mesh
          position={[1.16, 1.74, -0.45]}
        >
          <boxGeometry args={[0.18, 0.12, 0.42]} />
          <meshStandardMaterial
            color="#111111"
            roughness={0.25}
            metalness={0.75}
          />
        </mesh>

        <Wheel
          position={[-1.28, 0.56, -1.38]}
          steeringRef={frontLeftSteering}
          spinningRef={frontLeftSpinning}
        />

        <Wheel
          position={[1.28, 0.56, -1.38]}
          steeringRef={frontRightSteering}
          spinningRef={frontRightSpinning}
        />

        <Wheel
          position={[-1.28, 0.56, 1.38]}
          spinningRef={rearLeftSpinning}
        />

        <Wheel
          position={[1.28, 0.56, 1.38]}
          spinningRef={rearRightSpinning}
        />
      </group>
    </RigidBody>
  );
}