import React from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { MainlandMap } from "../world/MainlandMap";
import { IslandMap } from "../world/IslandMap";
import { BridgeNetwork } from "../world/BridgeNetwork";

function Ground() {
  return (
    <group>
      {/* Main city ground */}
      <RigidBody type="fixed" colliders={false}>
        <mesh position={[25, -0.7, 20]} receiveShadow>
          <boxGeometry args={[280, 1, 240]} />
          <meshStandardMaterial
            color="#4f633f"
            roughness={1}
          />
        </mesh>

        <CuboidCollider
          args={[140, 0.5, 120]}
          position={[25, -0.7, 20]}
        />
      </RigidBody>

      {/* Lagoon / water */}
      <RigidBody type="fixed" colliders={false}>
        <mesh position={[45, -0.15, -5]} receiveShadow>
          <boxGeometry args={[70, 0.35, 220]} />
          <meshStandardMaterial
            color="#155e75"
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>

        <CuboidCollider
          args={[35, 0.175, 110]}
          position={[45, -0.15, -5]}
        />
      </RigidBody>
    </group>
  );
}

export default function LagosWorld() {
  return (
    <group>
      <Ground />

      <MainlandMap />

      <IslandMap />

      <BridgeNetwork />
    </group>
  );
}