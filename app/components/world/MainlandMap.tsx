"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

import {
  Road,
  Sidewalk,
  RoadMarkings,
  Intersection,
  MajorRoad,
} from "./RoadSystem";

/* ============================================================================
   TYPES
============================================================================ */

type Vec3 = [number, number, number];

/* ============================================================================
   SMALL REUSABLE PARTS
============================================================================ */

function Window({
  position,
  size = [1.1, 1.4],
  color = "#0b1c2b",
  frameColor = "#2a2a2a",
  lit = false,
}: {
  position: Vec3;
  size?: [number, number];
  color?: string;
  frameColor?: string;
  lit?: boolean;
}) {
  const [w, h] = size;
  return (
    <group position={position}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[w + 0.12, h + 0.12, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.7} />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[w, h, 0.02]} />
        <meshStandardMaterial
          color={lit ? "#ffe9a8" : color}
          emissive={lit ? "#ffca5c" : "#000000"}
          emissiveIntensity={lit ? 1.2 : 0}
          metalness={0.5}
          roughness={0.15}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Mullions */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.04, h, 0.02]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[w, 0.04, 0.02]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>
    </group>
  );
}

function ACUnit({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.4, 0.4]} />
        <meshStandardMaterial color="#c8cdd2" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Fan grille */}
      <mesh position={[0, 0, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 12]} />
        <meshStandardMaterial color="#7a8085" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

function RooftopVent({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.4, 12]} />
        <meshStandardMaterial color="#9aa0a6" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.06, 12]} />
        <meshStandardMaterial color="#4b4f54" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Door({
  position,
  rotation = 0,
  color = "#3b1f0f",
}: {
  position: Vec3;
  rotation?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh>
        <boxGeometry args={[1.1, 2.2, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.42, 0, 0.06]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[1.25, 0.12, 0.12]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[-0.62, 0, 0]}>
        <boxGeometry args={[0.12, 2.3, 0.12]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0.62, 0, 0]}>
        <boxGeometry args={[0.12, 2.3, 0.12]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </group>
  );
}

/* ============================================================================
   BUILDING SYSTEM — realistic multi-story buildings with windows, AC, roof
============================================================================ */

interface BuildingProps {
  position: Vec3;
  size: Vec3; // [width, height, depth]
  color?: string;
  roofColor?: string;
  windowRows?: number; // auto if omitted
  windowsPerRow?: number;
  litProbability?: number;
  hasAC?: boolean;
  hasRoofVent?: boolean;
  hasSign?: boolean;
  signText?: string;
  signColor?: string;
  seed?: number;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Building({
  position,
  size,
  color = "#8a7f74",
  roofColor = "#3b3b3b",
  windowRows,
  windowsPerRow,
  litProbability = 0.25,
  hasAC = true,
  hasRoofVent = true,
  hasSign = false,
  signText = "SHOP",
  signColor = "#c2410c",
  seed = 1,
}: BuildingProps) {
  const [w, h, d] = size;
  const rand = useMemo(() => mulberry32(seed), [seed]);

  const rows = windowRows ?? Math.max(2, Math.floor(h / 2.2));
  const cols = windowsPerRow ?? Math.max(2, Math.floor(w / 1.8));

  const windowW = 0.9;
  const windowH = 1.2;

  const floorHeight = h / rows;
  const colSpacing = w / (cols + 1);

  // Precompute lit states per floor/window so they're stable across renders
  const litStates = useMemo(() => {
    const arr: boolean[] = [];
    for (let i = 0; i < rows * cols; i++) {
      arr.push(rand() < litProbability);
    }
    return arr;
  }, [rows, cols, litProbability, rand]);

  const windows: React.ReactNode[] = [];

  for (let r = 0; r < rows; r++) {
    const y = -h / 2 + floorHeight * (r + 0.5);

    for (let c = 0; c < cols; c++) {
      const x = -w / 2 + colSpacing * (c + 1);
      const lit = litStates[r * cols + c];

      // Front face (+Z)
      windows.push(
        <Window
          key={`f-${r}-${c}`}
          position={[x, y, d / 2 + 0.02]}
          size={[windowW, windowH]}
          lit={lit}
        />
      );

      // Back face (−Z)
      windows.push(
        <Window
          key={`b-${r}-${c}`}
          position={[x, y, -d / 2 - 0.02]}
          size={[windowW, windowH]}
          lit={lit}
        />
      );
    }

    // Side faces (left/right)
    const sideCols = Math.max(2, Math.floor(d / 1.8));
    const sideSpacing = d / (sideCols + 1);
    for (let c = 0; c < sideCols; c++) {
      const z = -d / 2 + sideSpacing * (c + 1);
      const lit = litStates[(r * cols + c) % litStates.length];

      windows.push(
        <Window
          key={`l-${r}-${c}`}
          position={[-w / 2 - 0.02, y, z]}
          size={[windowW, windowH]}
          lit={lit}
        />
      );
      windows.push(
        <Window
          key={`r-${r}-${c}`}
          position={[w / 2 + 0.02, y, z]}
          size={[windowW, windowH]}
          lit={lit}
        />
      );
    }
  }

  return (
    <group position={position}>
      {/* Main mass */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>

      {/* Base / plinth */}
      <mesh position={[0, -h / 2 + 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.3, 0.3, d + 0.3]} />
        <meshStandardMaterial color="#4b4b4b" roughness={0.95} />
      </mesh>

      {/* Roof cap */}
      <mesh position={[0, h / 2 + 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.25, 0.16, d + 0.25]} />
        <meshStandardMaterial color={roofColor} roughness={0.9} />
      </mesh>

      {/* Parapet */}
      <mesh position={[0, h / 2 + 0.32, d / 2 - 0.05]}>
        <boxGeometry args={[w + 0.25, 0.3, 0.1]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
      <mesh position={[0, h / 2 + 0.32, -d / 2 + 0.05]}>
        <boxGeometry args={[w + 0.25, 0.3, 0.1]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
      <mesh position={[w / 2 - 0.05, h / 2 + 0.32, 0]}>
        <boxGeometry args={[0.1, 0.3, d + 0.25]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
      <mesh position={[-w / 2 + 0.05, h / 2 + 0.32, 0]}>
        <boxGeometry args={[0.1, 0.3, d + 0.25]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>

      {/* AC units scattered on roof */}
      {hasAC &&
        Array.from({ length: Math.max(1, Math.floor(w / 4)) }).map((_, i) => (
          <ACUnit
            key={`ac-${i}`}
            position={[
              -w / 2 + 1.5 + i * 2.5,
              h / 2 + 0.4,
              (rand() - 0.5) * (d - 2),
            ]}
          />
        ))}

      {/* Roof vent */}
      {hasRoofVent && (
        <RooftopVent position={[w / 2 - 1.5, h / 2 + 0.5, -d / 2 + 1.5]} />
      )}

      {/* Ground floor windows and door */}
      <Window
        position={[-colSpacing, -h / 2 + 1.2, d / 2 + 0.02]}
        size={[1.4, 1.6]}
        lit={false}
      />
      <Window
        position={[colSpacing, -h / 2 + 1.2, d / 2 + 0.02]}
        size={[1.4, 1.6]}
        lit={false}
      />
      <Door position={[0, -h / 2 + 1.1, d / 2 + 0.05]} />

      {/* Signage above door */}
      {hasSign && (
        <group position={[0, -h / 2 + 2.6, d / 2 + 0.08]}>
          <mesh>
            <boxGeometry args={[Math.min(w - 1, 4), 0.6, 0.12]} />
            <meshStandardMaterial
              color={signColor}
              emissive={signColor}
              emissiveIntensity={0.5}
              roughness={0.4}
            />
          </mesh>
        </group>
      )}

      {/* All windows */}
      {windows}
    </group>
  );
}

/* ============================================================================
   NATURE / STREET FURNITURE
============================================================================ */

function RealisticTree({ position, seed = 1 }: { position: Vec3; seed?: number }) {
  const rand = useMemo(() => mulberry32(seed), [seed]);
  const trunkH = 2.2 + rand() * 1.2;
  const canopyLayers = 3;

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, trunkH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.3, trunkH, 8]} />
        <meshStandardMaterial color="#4a3222" roughness={0.95} />
      </mesh>

      {/* Branches */}
      {Array.from({ length: 3 }).map((_, i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.3,
              trunkH - 0.4,
              Math.sin(angle) * 0.3,
            ]}
            rotation={[
              Math.sin(angle) * 0.6,
              angle,
              -Math.cos(angle) * 0.6,
            ]}
            castShadow
          >
            <cylinderGeometry args={[0.07, 0.12, 1.2, 6]} />
            <meshStandardMaterial color="#4a3222" />
          </mesh>
        );
      })}

      {/* Canopy — clustered spheres for organic look */}
      {Array.from({ length: canopyLayers * 4 }).map((_, i) => {
        const a = rand() * Math.PI * 2;
        const r = rand() * 0.9;
        const y = trunkH + 0.6 + rand() * 1.2;
        const scale = 0.55 + rand() * 0.35;
        return (
          <mesh
            key={`leaf-${i}`}
            position={[Math.cos(a) * r, y, Math.sin(a) * r]}
            scale={[scale, scale * 0.85, scale]}
            castShadow
          >
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#1e6b32" : i % 3 === 1 ? "#2b8a3e" : "#237a3b"}
              roughness={0.95}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Streetlight({
  position,
  rotation = 0,
}: {
  position: Vec3;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Pole */}
      <mesh castShadow position={[0, 3, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 6, 8]} />
        <meshStandardMaterial color="#3a3f45" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.5, 6, 0]} rotation={[0, 0, Math.PI / 2.4]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
        <meshStandardMaterial color="#3a3f45" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Lamp housing */}
      <mesh position={[1.05, 5.7, 0]} castShadow>
        <boxGeometry args={[0.4, 0.15, 0.25]} />
        <meshStandardMaterial color="#2a2e33" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Emissive panel */}
      <mesh position={[1.05, 5.6, 0]}>
        <boxGeometry args={[0.35, 0.03, 0.2]} />
        <meshStandardMaterial
          color="#fff4c2"
          emissive="#ffd27a"
          emissiveIntensity={2}
        />
      </mesh>
      {/* Point light for glow */}
      <pointLight
        position={[1.05, 5.5, 0]}
        color="#ffd27a"
        intensity={8}
        distance={14}
        decay={2}
      />
    </group>
  );
}

function TrafficLight({
  position,
  rotation = 0,
}: {
  position: Vec3;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 5, 8]} />
        <meshStandardMaterial color="#2a2e33" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.4, 0]} castShadow>
        <boxGeometry args={[0.5, 1.4, 0.35]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 4.9, 0.18]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#7f1d1d" emissive="#dc2626" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0, 4.4, 0.18]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#78350f" emissive="#f59e0b" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 3.9, 0.18]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function Bench({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.8, 0.1, 0.5]} />
        <meshStandardMaterial color="#7c4a23" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.85, -0.22]} castShadow>
        <boxGeometry args={[1.8, 0.6, 0.1]} />
        <meshStandardMaterial color="#7c4a23" roughness={0.85} />
      </mesh>
      {/* Legs */}
      {[-0.75, 0.75].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]} castShadow>
          <boxGeometry args={[0.08, 0.44, 0.5]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function FireHydrant({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.15, 0.6, 10]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.68, 0]} castShadow>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.6} />
      </mesh>
    </group>
  );
}

function TrashCan({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.24, 0.9, 12]} />
        <meshStandardMaterial color="#3f3f3f" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.92, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 12]} />
        <meshStandardMaterial color="#1f1f1f" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

function BusStop({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Roof */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <boxGeometry args={[3, 0.12, 1.4]} />
        <meshStandardMaterial color="#2563eb" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Posts */}
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 1.3, -0.6]} castShadow>
          <boxGeometry args={[0.1, 2.6, 0.1]} />
          <meshStandardMaterial color="#3a3f45" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* Back panel */}
      <mesh position={[0, 1.3, -0.62]}>
        <boxGeometry args={[2.8, 2.2, 0.05]} />
        <meshStandardMaterial
          color="#bae6fd"
          transparent
          opacity={0.35}
          metalness={0.3}
          roughness={0.15}
        />
      </mesh>
      {/* Bench */}
      <Bench position={[0, 0.02, -0.1]} />
      {/* Sign */}
      <mesh position={[-1.5, 1.8, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.06]} />
        <meshStandardMaterial
          color="#2563eb"
          emissive="#2563eb"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

function UtilityPole({
  position,
  rotation = 0,
  wireTo,
}: {
  position: Vec3;
  rotation?: number;
  wireTo?: Vec3;
}) {
  const wires = wireTo
    ? Array.from({ length: 3 }).map((_, i) => {
        const start = new THREE.Vector3(
          position[0],
          position[1] + 6.5 - i * 0.3,
          position[2]
        );
        const end = new THREE.Vector3(wireTo[0], wireTo[1] + 6.5 - i * 0.3, wireTo[2]);
        const mid = start.clone().add(end).multiplyScalar(0.5);
        mid.y -= 0.4;
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(12);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <primitive key={i} object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#1a1a1a" }))} />
        );
      })
    : null;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 3.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 7, 8]} />
        <meshStandardMaterial color="#4a3222" roughness={0.95} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 6.5, 0]} castShadow>
        <boxGeometry args={[2, 0.12, 0.12]} />
        <meshStandardMaterial color="#4a3222" roughness={0.95} />
      </mesh>
      {wires}
    </group>
  );
}

function Billboard({
  position,
  rotation = 0,
  color = "#dc2626",
}: {
  position: Vec3;
  rotation?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-1, 1].map((x) => (
        <mesh key={x} position={[x * 1.6, 1.8, 0]} castShadow>
          <boxGeometry args={[0.18, 3.6, 0.18]} />
          <meshStandardMaterial color="#3a3f45" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 4.2, 0]} castShadow>
        <boxGeometry args={[4.4, 2.4, 0.16]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, 4.2, 0.1]}>
        <boxGeometry args={[4, 2, 0.02]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

function ParkedCar({
  position,
  rotation = 0,
  color = "#1e293b",
}: {
  position: Vec3;
  rotation?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Body */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.6, 4]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 1.05, 0.1]} castShadow>
        <boxGeometry args={[1.65, 0.6, 2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 1.05, 1.06]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.5, 0.5, 0.05]} />
        <meshStandardMaterial color="#0b1c2b" metalness={0.4} roughness={0.15} transparent opacity={0.85} />
      </mesh>
      {/* Wheels */}
      {[-0.9, 0.9].map((x) =>
        [-1.3, 1.3].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.3, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.22, 16]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
}

function WaterPlane({ position, size }: { position: Vec3; size: [number, number] }) {
  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={size} />
      <meshPhysicalMaterial
        color="#0e4d6b"
        roughness={0.08}
        metalness={0.2}
        transmission={0.4}
        thickness={2}
        clearcoat={1}
        clearcoatRoughness={0.05}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

/* ============================================================================
   MAIN MAP
============================================================================ */

export function MainlandMap() {
  /* ----------------------------------------------------------------
     Precompute repeating street furniture positions so the JSX is clean
  ---------------------------------------------------------------- */
  const streetlights = useMemo(() => {
    const arr: { pos: Vec3; rot: number }[] = [];
    // Along north/south road at x = -35
    for (let z = -110; z <= 110; z += 22) {
      arr.push({ pos: [-30, 0, z], rot: Math.PI });
      arr.push({ pos: [-40, 0, z + 11], rot: 0 });
    }
    // Along east/west road at z = -35
    for (let x = -110; x <= 110; x += 22) {
      arr.push({ pos: [x, 0, -30], rot: -Math.PI / 2 });
      arr.push({ pos: [x + 11, 0, -40], rot: Math.PI / 2 });
    }
    return arr;
  }, []);

  const trees = useMemo(() => {
    const arr: Vec3[] = [];
    const rand = mulberry32(42);
    // Row of trees along sidewalk edges
    for (let z = -100; z <= 100; z += 8) {
      if (Math.abs(z) < 12) continue;
      arr.push([-46 + (rand() - 0.5) * 0.6, 0, z]);
      arr.push([-24 + (rand() - 0.5) * 0.6, 0, z]);
    }
    for (let x = -100; x <= 100; x += 8) {
      if (Math.abs(x + 35) < 12) continue;
      arr.push([x, 0, -46 + (rand() - 0.5) * 0.6]);
      arr.push([x, 0, -24 + (rand() - 0.5) * 0.6]);
    }
    // Park cluster
    for (let i = 0; i < 40; i++) {
      arr.push([
        60 + (rand() - 0.5) * 60,
        0,
        60 + (rand() - 0.5) * 60,
      ]);
    }
    return arr;
  }, []);

  const parkedCars = useMemo(() => {
    const arr: { pos: Vec3; rot: number; color: string }[] = [];
    const colors = ["#1e293b", "#7f1d1d", "#1e3a8a", "#3f3f46", "#ffffff", "#b91c1c"];
    const rand = mulberry32(7);
    for (let z = -100; z <= 100; z += 14) {
      if (Math.abs(z) < 14) continue;
      arr.push({
        pos: [-45, 0, z],
        rot: 0,
        color: colors[Math.floor(rand() * colors.length)],
      });
    }
    for (let x = -100; x <= 100; x += 14) {
      if (Math.abs(x + 35) < 14) continue;
      arr.push({
        pos: [x, 0, -45],
        rot: Math.PI / 2,
        color: colors[Math.floor(rand() * colors.length)],
      });
    }
    return arr;
  }, []);

  const utilityPoles = useMemo(() => {
    const arr: { pos: Vec3; next?: Vec3 }[] = [];
    const positions: Vec3[] = [];
    for (let z = -100; z <= 100; z += 30) {
      positions.push([-60, 0, z]);
    }
    positions.forEach((p, i) => {
      arr.push({ pos: p, next: positions[i + 1] });
    });
    return arr;
  }, []);

  return (
    <group>
      {/* ============================================================
          GROUND / TERRAIN
      ============================================================ */}
      {/* Base ground — huge plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#4a5b3a" roughness={0.95} />
      </mesh>

      {/* Grass patch in the park area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[60, 0.005, 60]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#2f6b30" roughness={0.95} />
      </mesh>

      {/* Water — lagoon */}
      <WaterPlane position={[180, 0.02, 0]} size={[160, 600]} />

      {/* ============================================================
          ROADS
      ============================================================ */}
      {/* Main north/south road */}
      <MajorRoad position={[-35, 0, 0]} length={260} rotation={[0, 0, 0]} />

      {/* Main east/west road */}
      <MajorRoad position={[0, 0, -35]} length={260} rotation={[0, Math.PI / 2, 0]} />

      {/* Secondary roads */}
      <Road position={[-10, 0.03, 30]} width={9} length={120} />
      <Road position={[-85, 0.03, 30]} width={9} length={120} />
      <Road position={[-10, 0.03, 90]} width={9} length={120} />

      <Road position={[0, 0.03, 10]} width={9} length={120} rotation={[0, Math.PI / 2, 0]} />
      <Road position={[0, 0.03, 90]} width={9} length={120} rotation={[0, Math.PI / 2, 0]} />
      <Road position={[0, 0.03, -110]} width={9} length={120} rotation={[0, Math.PI / 2, 0]} />

      {/* Intersections */}
      <Intersection position={[-35, 0.04, -35]} size={16} />
      <Intersection position={[-35, 0.04, 30]} size={16} />
      <Intersection position={[0, 0.04, -35]} size={16} />
      <Intersection position={[-35, 0.04, 90]} size={16} />

      {/* Sidewalks */}
      <Sidewalk position={[-35, 0.02, 0]} length={260} side="left" />
      <Sidewalk position={[-35, 0.02, 0]} length={260} side="right" />
      <Sidewalk position={[0, 0.02, -35]} length={260} side="left" rotation={[0, Math.PI / 2, 0]} />
      <Sidewalk position={[0, 0.02, -35]} length={260} side="right" rotation={[0, Math.PI / 2, 0]} />

      {/* Lane markings */}
      <RoadMarkings position={[-35, 0.05, 0]} length={260} rotation={[0, 0, 0]} />
      <RoadMarkings position={[0, 0.05, -35]} length={260} rotation={[0, Math.PI / 2, 0]} />

      {/* ============================================================
          STREETLIGHTS
      ============================================================ */}
      {streetlights.map((s, i) => (
        <Streetlight key={`sl-${i}`} position={s.pos} rotation={s.rot} />
      ))}

      {/* ============================================================
          TRAFFIC LIGHTS AT INTERSECTIONS
      ============================================================ */}
      <TrafficLight position={[-43, 0, -43]} rotation={0} />
      <TrafficLight position={[-27, 0, -43]} rotation={Math.PI} />
      <TrafficLight position={[-43, 0, -27]} rotation={-Math.PI / 2} />
      <TrafficLight position={[-27, 0, -27]} rotation={Math.PI / 2} />

      <TrafficLight position={[-43, 0, 22]} rotation={0} />
      <TrafficLight position={[-27, 0, 22]} rotation={Math.PI} />

      {/* ============================================================
          DOWNTOWN BUILDINGS — north of main EW road
      ============================================================ */}
      <Building
        position={[-75, 12, -75]}
        size={[20, 24, 20]}
        color="#5a6473"
        roofColor="#2a2e33"
        seed={101}
        litProbability={0.4}
        hasSign
        signColor="#dc2626"
      />

      <Building
        position={[-50, 9, -80]}
        size={[16, 18, 16]}
        color="#71717a"
        roofColor="#27272a"
        seed={102}
        litProbability={0.35}
      />

      <Building
        position={[-22, 15, -78]}
        size={[18, 30, 18]}
        color="#4b5563"
        roofColor="#1f2937"
        seed={103}
        litProbability={0.45}
        hasSign
        signColor="#0ea5e9"
      />

      <Building
        position={[-100, 8, -85]}
        size={[22, 16, 22]}
        color="#6b7280"
        roofColor="#1f2937"
        seed={104}
        litProbability={0.3}
      />

      <Building
        position={[-70, 14, -125]}
        size={[24, 28, 24]}
        color="#525866"
        roofColor="#1e242c"
        seed={105}
        litProbability={0.5}
        hasSign
        signColor="#16a34a"
      />

      <Building
        position={[-25, 10, -120]}
        size={[20, 20, 20]}
        color="#4d5560"
        roofColor="#20242b"
        seed={106}
        litProbability={0.35}
      />

      {/* ============================================================
          DOWNTOWN BUILDINGS — south side of main EW road
      ============================================================ */}
      <Building
        position={[-75, 7, 0]}
        size={[18, 14, 18]}
        color="#8b8475"
        roofColor="#3f3f3f"
        seed={201}
        litProbability={0.25}
      />

      <Building
        position={[-75, 11, 25]}
        size={[22, 22, 18]}
        color="#7a7268"
        roofColor="#333"
        seed={202}
        litProbability={0.35}
        hasSign
        signColor="#ea580c"
      />

      <Building
        position={[-55, 6, 55]}
        size={[16, 12, 16]}
        color="#9a8b76"
        roofColor="#3f3f3f"
        seed={203}
      />

      {/* ============================================================
          RESIDENTIAL AREA — southeast
      ============================================================ */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Building
          key={`res-a-${i}`}
          position={[-120 + i * 22, 4, 120]}
          size={[12, 8, 12]}
          color={i % 2 === 0 ? "#e7d3a1" : "#d1b8a3"}
          roofColor="#8b2c1d"
          seed={300 + i}
          litProbability={0.2}
          hasSign={false}
        />
      ))}

      {Array.from({ length: 6 }).map((_, i) => (
        <Building
          key={`res-b-${i}`}
          position={[-120 + i * 22, 5, 150]}
          size={[14, 10, 13]}
          color={i % 2 === 0 ? "#cbd5e1" : "#fde68a"}
          roofColor="#7c2d12"
          seed={400 + i}
          litProbability={0.2}
        />
      ))}

      {Array.from({ length: 5 }).map((_, i) => (
        <Building
          key={`res-c-${i}`}
          position={[-100 + i * 24, 6, 180]}
          size={[15, 12, 14]}
          color={i % 2 === 0 ? "#a5b4fc" : "#fca5a5"}
          roofColor="#1f2937"
          seed={500 + i}
          litProbability={0.25}
        />
      ))}

      {/* ============================================================
          INDUSTRIAL AREA — northwest
      ============================================================ */}
      <Building
        position={[-150, 6, -100]}
        size={[40, 12, 30]}
        color="#52525b"
        roofColor="#18181b"
        seed={600}
        litProbability={0.2}
      />
      <Building
        position={[-150, 5, -60]}
        size={[35, 10, 25]}
        color="#4b5563"
        roofColor="#18181b"
        seed={601}
        litProbability={0.15}
      />

      {/* ============================================================
          WATERFRONT / LAGOON SIDE — east of x=0
      ============================================================ */}
      <Building
        position={[60, 18, 0]}
        size={[22, 36, 22]}
        color="#475569"
        roofColor="#0f172a"
        seed={700}
        litProbability={0.55}
        hasSign
        signColor="#0891b2"
      />
      <Building
        position={[60, 12, 35]}
        size={[20, 24, 20]}
        color="#5a6473"
        roofColor="#0f172a"
        seed={701}
        litProbability={0.4}
      />
      <Building
        position={[60, 10, 70]}
        size={[18, 20, 18]}
        color="#64748b"
        roofColor="#0f172a"
        seed={702}
        litProbability={0.45}
      />

      {/* ============================================================
          PARK — southeast of x=0, z=60
      ============================================================ */}
      {trees.map((p, i) => (
        <RealisticTree key={`tree-${i}`} position={p} seed={i + 1} />
      ))}

      <Bench position={[45, 0, 60]} rotation={0} />
      <Bench position={[45, 0, 70]} rotation={0} />
      <Bench position={[75, 0, 65]} rotation={Math.PI} />
      <Bench position={[75, 0, 55]} rotation={Math.PI} />
      <Bench position={[60, 0, 45]} rotation={Math.PI / 2} />

      <FireHydrant position={[30, 0, 40]} />
      <FireHydrant position={[90, 0, 80]} />
      <TrashCan position={[42, 0, 62]} />
      <TrashCan position={[78, 0, 58]} />

      {/* ============================================================
          STREET FURNITURE ALONG MAIN ROADS
      ============================================================ */}
      <BusStop position={[-25, 0, 10]} rotation={-Math.PI / 2} />
      <BusStop position={[-45, 0, 40]} rotation={Math.PI / 2} />
      <BusStop position={[30, 0, -25]} rotation={0} />

      {/* Parked cars */}
      {parkedCars.map((c, i) => (
        <ParkedCar
          key={`car-${i}`}
          position={c.pos}
          rotation={c.rot}
          color={c.color}
        />
      ))}

      {/* Utility poles with wires */}
      {utilityPoles.map((p, i) => (
        <UtilityPole key={`pole-${i}`} position={p.pos} wireTo={p.next} />
      ))}

      {/* Billboards */}
      <Billboard position={[-90, 0, 20]} rotation={Math.PI / 4} color="#dc2626" />
      <Billboard position={[40, 0, -80]} rotation={-Math.PI / 3} color="#2563eb" />
      <Billboard position={[-20, 0, 140]} rotation={0} color="#16a34a" />

      {/* Fire hydrants along roads */}
      <FireHydrant position={[-30, 0, -50]} />
      <FireHydrant position={[-40, 0, 50]} />
      <FireHydrant position={[-20, 0, -100]} />
    </group>
  );
}