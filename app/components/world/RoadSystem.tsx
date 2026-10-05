"use client";

import React, { useMemo } from "react";

/* ============================================================================
   TYPES
============================================================================ */

type RoadProps = {
  position: [number, number, number];
  width?: number;
  length?: number;
  rotation?: [number, number, number];
  color?: string;
};

type MajorRoadProps = {
  position: [number, number, number];
  length?: number;
  rotation?: [number, number, number];
};

/* ============================================================================
   SMALL PARTS
============================================================================ */

function DashedLine({
  x,
  z,
  length,
  rotation = [0, 0, 0],
  color = "#f1f5f9",
  dashLength = 2,
  gapLength = 1.6,
  width = 0.18,
}: {
  x: number;
  z: number;
  length: number;
  rotation?: [number, number, number];
  color?: string;
  dashLength?: number;
  gapLength?: number;
  width?: number;
}) {
  const count = Math.floor(length / (dashLength + gapLength));
  const dashes = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < count; i++) {
      arr.push(-length / 2 + (dashLength + gapLength) * i + dashLength / 2);
    }
    return arr;
  }, [count, dashLength, gapLength, length]);

  return (
    <group position={[x, 0.065, z]} rotation={rotation as any}>
      {dashes.map((dz, i) => (
        <mesh key={i} position={[0, 0, dz]}>
          <boxGeometry args={[width, 0.02, dashLength]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Crosswalk({
  position,
  rotation = [0, 0, 0],
  width = 6,
  stripes = 6,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  stripes?: number;
}) {
  const stripeSpacing = width / (stripes + 1);
  return (
    <group position={[position[0], 0.07, position[2]]} rotation={rotation as any}>
      {Array.from({ length: stripes }).map((_, i) => {
        const x = -width / 2 + stripeSpacing * (i + 1);
        return (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[0.4, 0.02, 1.8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

function Curb({
  position,
  length,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  length: number;
  rotation?: [number, number, number];
}) {
  return (
    <mesh
      position={[position[0], 0.09, position[2]]}
      rotation={rotation as any}
      receiveShadow
    >
      <boxGeometry args={[0.24, 0.2, length]} />
      <meshStandardMaterial color="#a8a8a8" roughness={0.92} />
    </mesh>
  );
}

function Manhole({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], 0.055, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.4, 16]} />
      <meshStandardMaterial color="#1f1f1f" metalness={0.6} roughness={0.55} />
    </mesh>
  );
}

/* ============================================================================
   PUBLIC COMPONENTS (backward-compatible signatures)
============================================================================ */

export function Road({
  position,
  width = 8,
  length = 30,
  rotation = [0, 0, 0],
  color = "#232323",
}: RoadProps) {
  return (
    <group>
      <mesh position={position} rotation={rotation as any} receiveShadow>
        <boxGeometry args={[width, 0.08, length]} />
        <meshStandardMaterial color={color} roughness={0.96} />
      </mesh>

      {/* Center dashed line */}
      <DashedLine
        x={position[0]}
        z={position[2]}
        length={length}
        rotation={rotation}
        dashLength={2}
        gapLength={2}
        width={0.14}
      />

      {/* Curbs on both sides */}
      <Curb
        position={[position[0] - width / 2 - 0.12, position[1], position[2]]}
        length={length}
        rotation={rotation}
      />
      <Curb
        position={[position[0] + width / 2 + 0.12, position[1], position[2]]}
        length={length}
        rotation={rotation}
      />
    </group>
  );
}

export function Sidewalk({
  position,
  width = 2,
  length = 30,
  rotation = [0, 0, 0],
}: RoadProps) {
  return (
    <mesh position={position} rotation={rotation as any} receiveShadow>
      <boxGeometry args={[width, 0.18, length]} />
      <meshStandardMaterial color="#8a8a8a" roughness={0.9} />
    </mesh>
  );
}

export function RoadMarkings({
  position,
  width = 0.18,
  length = 30,
  rotation = [0, 0, 0],
}: RoadProps) {
  return (
    <DashedLine
      x={position[0]}
      z={position[2]}
      length={length}
      rotation={rotation}
      width={width}
      dashLength={2}
      gapLength={2}
    />
  );
}

export function Intersection({
  position,
  size = 12,
}: {
  position: [number, number, number];
  size?: number;
}) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh receiveShadow>
        <boxGeometry args={[size, 0.09, size]} />
        <meshStandardMaterial color="#222222" roughness={0.96} />
      </mesh>

      {/* Crosswalks on each side */}
      <Crosswalk
        position={[0, 0, size / 2 + 0.9]}
        rotation={[0, 0, 0]}
        width={size - 2}
      />
      <Crosswalk
        position={[0, 0, -size / 2 - 0.9]}
        rotation={[0, 0, 0]}
        width={size - 2}
      />
      <Crosswalk
        position={[size / 2 + 0.9, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={size - 2}
      />
      <Crosswalk
        position={[-size / 2 - 0.9, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={size - 2}
      />

      {/* Manholes */}
      <Manhole position={[size / 4, 0, -size / 4]} />
      <Manhole position={[-size / 4, 0, size / 4]} />
    </group>
  );
}

export function Drainage({
  position,
  width = 0.5,
  length = 30,
  rotation = [0, 0, 0],
}: RoadProps) {
  return (
    <group>
      <mesh position={position} rotation={rotation as any} receiveShadow>
        <boxGeometry args={[width, 0.12, length]} />
        <meshStandardMaterial color="#141414" roughness={0.9} />
      </mesh>
      {/* Grille bars */}
      {Array.from({ length: Math.floor(length / 0.5) }).map((_, i) => (
        <mesh
          key={i}
          position={[
            position[0],
            position[1] + 0.07,
            position[2] - length / 2 + 0.25 + i * 0.5,
          ]}
          rotation={rotation as any}
        >
          <boxGeometry args={[width * 0.9, 0.03, 0.06]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export function MajorRoad({
  position,
  length = 80,
  rotation = [0, 0, 0],
}: MajorRoadProps) {
  const width = 12;
  const sidewalkOffset = width / 2 + 1.2;

  return (
    <group>
      {/* Road surface */}
      <Road
        position={position}
        width={width}
        length={length}
        rotation={rotation}
        color="#1c1c1c"
      />

      {/* Double center line */}
      <DashedLine
        x={position[0] - 0.18}
        z={position[2]}
        length={length}
        rotation={rotation}
        width={0.14}
        dashLength={3}
        gapLength={2}
      />
      <DashedLine
        x={position[0] + 0.18}
        z={position[2]}
        length={length}
        rotation={rotation}
        width={0.14}
        dashLength={3}
        gapLength={2}
      />

      {/* Sidewalk slabs */}
      <Sidewalk
        position={[
          position[0] - sidewalkOffset,
          position[1] + 0.02,
          position[2],
        ]}
        width={2.2}
        length={length}
        rotation={rotation}
      />
      <Sidewalk
        position={[
          position[0] + sidewalkOffset,
          position[1] + 0.02,
          position[2],
        ]}
        width={2.2}
        length={length}
        rotation={rotation}
      />

      {/* Drainage channels just outside curbs */}
      <Drainage
        position={[
          position[0] - sidewalkOffset - 1.3,
          position[1] + 0.05,
          position[2],
        ]}
        width={0.4}
        length={length}
        rotation={rotation}
      />
      <Drainage
        position={[
          position[0] + sidewalkOffset + 1.3,
          position[1] + 0.05,
          position[2],
        ]}
        width={0.4}
        length={length}
        rotation={rotation}
      />

      {/* Manholes along the road */}
      {Array.from({ length: Math.max(2, Math.floor(length / 30)) }).map(
        (_, i) => {
          const dz = -length / 2 + (length / (Math.floor(length / 30) + 1)) * (i + 1);
          const cos = Math.cos(rotation[1]);
          const sin = Math.sin(rotation[1]);
          const dx = sin * dz;
          const dzz = cos * dz;
          return (
            <Manhole
              key={i}
              position={[
                position[0] + dx + 2,
                position[1] + 0.05,
                position[2] + dzz,
              ]}
            />
          );
        }
      )}
    </group>
  );
}