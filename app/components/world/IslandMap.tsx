"use client";

import React, { useMemo } from "react";
import { Road, Intersection, MajorRoad } from "./RoadSystem";

/* ============================================================================
   HELPERS
============================================================================ */

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Vec3 = [number, number, number];

/* ============================================================================
   TOWER — modern glass high-rise
============================================================================ */

function TowerWindow({
  position,
  size = [1, 1.4],
  lit,
}: {
  position: Vec3;
  size?: [number, number];
  lit: boolean;
}) {
  const [w, h] = size;
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[w, h, 0.04]} />
        <meshStandardMaterial
          color={lit ? "#ffe9a8" : "#0a1420"}
          emissive={lit ? "#ffce6e" : "#000000"}
          emissiveIntensity={lit ? 1.1 : 0}
          metalness={0.75}
          roughness={0.08}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

function TowerACUnit({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.5, 0.5]} />
        <meshStandardMaterial color="#b7bec6" metalness={0.55} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 12]} />
        <meshStandardMaterial color="#7c848c" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Tower({
  position,
  height,
  width,
  color,
  seed = 1,
}: {
  position: Vec3;
  height: number;
  width: number;
  color: string;
  seed?: number;
}) {
  const rand = useMemo(() => mulberry32(seed), [seed]);
  const rows = Math.max(4, Math.floor(height / 2.6));
  const cols = Math.max(3, Math.floor(width / 2.2));
  const floorH = height / rows;
  const colSpacing = width / (cols + 1);

  const litStates = useMemo(
    () => Array.from({ length: rows * cols }, () => rand() < 0.4),
    [rows, cols, rand]
  );

  const windows: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const y = -height / 2 + floorH * (r + 0.5);
    for (let c = 0; c < cols; c++) {
      const x = -width / 2 + colSpacing * (c + 1);
      const lit = litStates[r * cols + c];
      windows.push(
        <TowerWindow key={`f-${r}-${c}`} position={[x, y, width / 2 + 0.02]} lit={lit} />,
        <TowerWindow key={`b-${r}-${c}`} position={[x, y, -width / 2 - 0.02]} lit={lit} />,
        <TowerWindow key={`l-${r}-${c}`} position={[-width / 2 - 0.02, y, x]} lit={lit} />,
        <TowerWindow key={`r-${r}-${c}`} position={[width / 2 + 0.02, y, x]} lit={lit} />
      );
    }
  }

  return (
    <group position={[position[0], position[1] + height / 2, position[2]]}>
      {/* Main mass */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, width]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.35}
        />
      </mesh>

      {/* Curtain wall sheen (thin outer shell) */}
      <mesh scale={[1.005, 1, 1.005]}>
        <boxGeometry args={[width, height, width]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.9}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Roof cap */}
      <mesh position={[0, height / 2 + 0.15, 0]} castShadow>
        <boxGeometry args={[width + 0.3, 0.3, width + 0.3]} />
        <meshStandardMaterial color="#1f242b" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Rooftop antenna */}
      <mesh position={[width / 2 - 1, height / 2 + 2.5, -width / 2 + 1]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 5, 6]} />
        <meshStandardMaterial color="#2a2e33" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[width / 2 - 1, height / 2 + 5.1, -width / 2 + 1]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial
          color="#ff2222"
          emissive="#ff2222"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Rooftop AC units */}
      {Array.from({ length: 3 }).map((_, i) => (
        <TowerACUnit
          key={`ac-${i}`}
          position={[
            -width / 2 + 1.2 + i * 2.2,
            height / 2 + 0.5,
            width / 2 - 1.5,
          ]}
        />
      ))}

      {/* Ground floor glazing + entrance */}
      <mesh position={[0, -height / 2 + 1.6, width / 2 + 0.03]}>
        <boxGeometry args={[width - 1, 2.6, 0.06]} />
        <meshPhysicalMaterial
          color="#0a1a2a"
          metalness={0.85}
          roughness={0.1}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Windows */}
      {windows}

      {/* Vertical mullions */}
      {Array.from({ length: cols + 1 }).map((_, i) => {
        const x = -width / 2 + (width / (cols + 1)) * (i + 1);
        return (
          <mesh key={`m-${i}`} position={[x, 0, width / 2 + 0.03]}>
            <boxGeometry args={[0.08, height, 0.06]} />
            <meshStandardMaterial color="#2a2f36" metalness={0.6} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ============================================================================
   ESTATE — Lekki-style gated residential block
============================================================================ */

function EstateWindow({
  position,
  lit,
}: {
  position: Vec3;
  lit: boolean;
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1, 1.2, 0.05]} />
        <meshStandardMaterial
          color={lit ? "#ffe9a8" : "#132030"}
          emissive={lit ? "#ffce6e" : "#000000"}
          emissiveIntensity={lit ? 1.2 : 0}
          metalness={0.4}
          roughness={0.15}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[1.12, 1.32, 0.02]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
    </group>
  );
}

function Estate({
  position,
  seed = 1,
  bodyColor = "#e5e7eb",
  roofColor = "#0f172a",
}: {
  position: Vec3;
  seed?: number;
  bodyColor?: string;
  roofColor?: string;
}) {
  const rand = useMemo(() => mulberry32(seed), [seed]);
  const W = 15;
  const D = 14;
  const H = 6.5;

  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* Body */}
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color={bodyColor} roughness={0.72} />
      </mesh>

      {/* Plinth */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[W + 0.4, 0.3, D + 0.4]} />
        <meshStandardMaterial color="#4b4b4b" roughness={0.95} />
      </mesh>

      {/* Roof slab */}
      <mesh position={[0, H + 0.2, 0]} castShadow>
        <boxGeometry args={[W + 0.5, 0.4, D + 0.5]} />
        <meshStandardMaterial color={roofColor} roughness={0.85} />
      </mesh>

      {/* Pitch roof panel */}
      <mesh
        position={[0, H + 0.9, 0]}
        rotation={[0, 0, 0]}
        castShadow
      >
        <boxGeometry args={[W + 0.2, 1.2, D + 0.2]} />
        <meshStandardMaterial color={roofColor} roughness={0.9} />
      </mesh>

      {/* Windows — front */}
      {[0, 1, 2].map((i) => {
        const x = -W / 2 + 3.5 + i * 4;
        return (
          <React.Fragment key={`fw-${i}`}>
            <EstateWindow position={[x, 1.8, D / 2 + 0.03]} lit={rand() < 0.4} />
            <EstateWindow position={[x, 4.6, D / 2 + 0.03]} lit={rand() < 0.4} />
          </React.Fragment>
        );
      })}

      {/* Door */}
      <group position={[0, 1.15, D / 2 + 0.06]}>
        <mesh>
          <boxGeometry args={[1.2, 2.3, 0.08]} />
          <meshStandardMaterial color="#3b1f0f" roughness={0.7} />
        </mesh>
        <mesh position={[0.45, 0, 0.06]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>

      {/* Porch */}
      <mesh position={[0, 2.6, D / 2 + 0.9]} castShadow>
        <boxGeometry args={[3.5, 0.18, 1.8]} />
        <meshStandardMaterial color={roofColor} roughness={0.7} />
      </mesh>

      {/* Porch pillars */}
      {[-1.5, 1.5].map((x) => (
        <mesh key={`p-${x}`} position={[x, 1.3, D / 2 + 1.5]} castShadow>
          <boxGeometry args={[0.22, 2.6, 0.22]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.7} />
        </mesh>
      ))}

      {/* Compound wall */}
      <mesh position={[0, 0.9, D / 2 + 2.5]} castShadow receiveShadow>
        <boxGeometry args={[W + 2, 1.8, 0.2]} />
        <meshStandardMaterial color="#c9b79b" roughness={0.9} />
      </mesh>
      {/* Gate gap already visually implied */}
    </group>
  );
}

/* ============================================================================
   STREETLIGHT (reused from mainland)
============================================================================ */

function Streetlight({
  position,
  rotation = 0,
}: {
  position: Vec3;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow position={[0, 3, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 6, 8]} />
        <meshStandardMaterial color="#3a3f45" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0.5, 6, 0]} rotation={[0, 0, Math.PI / 2.4]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
        <meshStandardMaterial color="#3a3f45" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[1.05, 5.7, 0]} castShadow>
        <boxGeometry args={[0.4, 0.15, 0.25]} />
        <meshStandardMaterial color="#2a2e33" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[1.05, 5.6, 0]}>
        <boxGeometry args={[0.35, 0.03, 0.2]} />
        <meshStandardMaterial
          color="#fff4c2"
          emissive="#ffd27a"
          emissiveIntensity={2}
        />
      </mesh>
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

/* ============================================================================
   WATER — surrounding the island
============================================================================ */

function WaterPlane({ position, size }: { position: Vec3; size: [number, number] }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
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

function Beach({
  position,
  size,
  rotation = 0,
}: {
  position: Vec3;
  size: [number, number];
  rotation?: number;
}) {
  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, rotation]}
      receiveShadow
    >
      <planeGeometry args={size} />
      <meshStandardMaterial color="#e4d3a8" roughness={0.95} />
    </mesh>
  );
}

function PalmTree({ position, seed = 1 }: { position: Vec3; seed?: number }) {
  const rand = useMemo(() => mulberry32(seed), [seed]);
  const h = 4.5 + rand() * 2;
  const fronds = 8;

  return (
    <group position={position}>
      {/* Curved trunk via two stacked cylinders */}
      <mesh position={[0, h * 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, h * 0.7, 8]} />
        <meshStandardMaterial color="#5b4632" roughness={0.95} />
      </mesh>
      <mesh position={[0.15, h * 0.85, 0]} rotation={[0, 0, -0.15]} castShadow>
        <cylinderGeometry args={[0.1, 0.18, h * 0.35, 8]} />
        <meshStandardMaterial color="#5b4632" roughness={0.95} />
      </mesh>

      {/* Coconut cluster */}
      {[0, 1, 2].map((i) => (
        <mesh key={`c-${i}`} position={[
          Math.cos((i / 3) * Math.PI * 2) * 0.2,
          h - 0.1,
          Math.sin((i / 3) * Math.PI * 2) * 0.2,
        ]}>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial color="#3d2817" roughness={0.9} />
        </mesh>
      ))}

      {/* Fronds */}
      {Array.from({ length: fronds }).map((_, i) => {
        const a = (i / fronds) * Math.PI * 2;
        return (
          <group
            key={`f-${i}`}
            position={[0.15, h + 0.1, 0]}
            rotation={[0, a, -0.6 + rand() * 0.3]}
          >
            <mesh position={[0, 0, 1.4]} rotation={[Math.PI / 2.2, 0, 0]} castShadow>
              <boxGeometry args={[0.28, 0.04, 2.8]} />
              <meshStandardMaterial color="#1e6b32" roughness={0.9} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ============================================================================
   MAIN ISLAND MAP
============================================================================ */

export function IslandMap() {
  const streetlights = useMemo(() => {
    const arr: { pos: Vec3; rot: number }[] = [];
    for (let z = -100; z <= 100; z += 22) {
      arr.push({ pos: [74, 0, z], rot: Math.PI / 2 });
      arr.push({ pos: [86, 0, z + 11], rot: -Math.PI / 2 });
    }
    for (let x = 70; x <= 150; x += 22) {
      arr.push({ pos: [x, 0, -42], rot: 0 });
      arr.push({ pos: [x + 11, 0, -28], rot: Math.PI });
    }
    return arr;
  }, []);

  const palms = useMemo(() => {
    const arr: Vec3[] = [];
    const rand = mulberry32(11);
    // Beach line along the west shore of the island
    for (let z = -90; z <= 90; z += 12) {
      arr.push([56 + rand() * 1.5, 0, z]);
    }
    // Beach line along the east shore
    for (let z = -90; z <= 90; z += 14) {
      arr.push([162 + rand() * 1.5, 0, z]);
    }
    return arr;
  }, []);

  return (
    <group>
      {/* ============================================================
          GROUND & WATER
      ============================================================ */}
      {/* Island landmass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[110, -0.02, 0]} receiveShadow>
        <planeGeometry args={[130, 240]} />
        <meshStandardMaterial color="#5f7a4a" roughness={0.95} />
      </mesh>

      {/* Sand/beach strip on west edge */}
      <Beach position={[58, 0.01, 0]} size={[10, 240]} />

      {/* Sand/beach strip on east edge */}
      <Beach position={[162, 0.01, 0]} size={[10, 240]} />

      {/* Lagoon to the west (between mainland & island) */}
      <WaterPlane position={[0, -0.5, 0]} size={[120, 600]} />

      {/* Ocean to the east */}
      <WaterPlane position={[240, -0.5, 0]} size={[160, 600]} />

      {/* ============================================================
          ROADS
      ============================================================ */}
      {/* Main north/south island road */}
      <MajorRoad position={[80, 0, 0]} length={220} rotation={[0, 0, 0]} />

      {/* East/west cross roads */}
      <MajorRoad position={[110, 0, -35]} length={180} rotation={[0, Math.PI / 2, 0]} />
      <MajorRoad position={[110, 0, 90]} length={180} rotation={[0, Math.PI / 2, 0]} />

      {/* Secondary roads */}
      <Road position={[80, 0.03, 40]} width={9} length={90} />
      <Road position={[80, 0.03, 90]} width={9} length={90} />
      <Road position={[80, 0.03, -70]} width={9} length={90} />
      <Road position={[120, 0.03, 0]} width={9} length={90} rotation={[0, Math.PI / 2, 0]} />
      <Road position={[140, 0.03, 30]} width={9} length={90} rotation={[0, Math.PI / 2, 0]} />

      {/* Intersections */}
      <Intersection position={[80, 0.04, -35]} size={16} />
      <Intersection position={[80, 0.04, 40]} size={16} />
      <Intersection position={[80, 0.04, 90]} size={16} />
      <Intersection position={[110, 0.04, -35]} size={16} />
      <Intersection position={[110, 0.04, 90]} size={16} />

      {/* ============================================================
          VICTORIA ISLAND / IKOYI STYLE TOWERS
      ============================================================ */}
      <Tower position={[105, 0, -5]} height={28} width={14} color="#64748b" seed={101} />
      <Tower position={[125, 0, -5]} height={38} width={15} color="#94a3b8" seed={102} />
      <Tower position={[105, 0, 20]} height={22} width={13} color="#475569" seed={103} />
      <Tower position={[125, 0, 20]} height={45} width={16} color="#334155" seed={104} />
      <Tower position={[100, 0, 55]} height={32} width={14} color="#78716c" seed={105} />
      <Tower position={[130, 0, 55]} height={26} width={12} color="#525866" seed={106} />
      <Tower position={[140, 0, -20]} height={36} width={14} color="#5a6473" seed={107} />
      <Tower position={[140, 0, 5]} height={30} width={13} color="#475569" seed={108} />
      <Tower position={[150, 0, 40]} height={40} width={15} color="#334155" seed={109} />

      {/* ============================================================
          LEKKI-STYLE GATED ESTATES
      ============================================================ */}
      <Estate position={[100, 0, 105]} seed={201} bodyColor="#f5e7c8" roofColor="#7c2d12" />
      <Estate position={[125, 0, 105]} seed={202} bodyColor="#e5e7eb" roofColor="#0f172a" />
      <Estate position={[150, 0, 105]} seed={203} bodyColor="#dbeafe" roofColor="#1e293b" />
      <Estate position={[100, 0, 130]} seed={204} bodyColor="#fde68a" roofColor="#7c2d12" />
      <Estate position={[125, 0, 130]} seed={205} bodyColor="#f5f5f4" roofColor="#0f172a" />
      <Estate position={[150, 0, 130]} seed={206} bodyColor="#e7d3a1" roofColor="#7c2d12" />
      <Estate position={[90, 0, 70]} seed={207} bodyColor="#cbd5e1" roofColor="#1e293b" />
      <Estate position={[140, 0, 70]} seed={208} bodyColor="#fef3c7" roofColor="#7c2d12" />

      {/* ============================================================
          STREETLIGHTS
      ============================================================ */}
      {streetlights.map((s, i) => (
        <Streetlight key={`sl-${i}`} position={s.pos} rotation={s.rot} />
      ))}

      {/* ============================================================
          PALM TREES ALONG BEACHES
      ============================================================ */}
      {palms.map((p, i) => (
        <PalmTree key={`palm-${i}`} position={p} seed={i + 1} />
      ))}

      {/* ============================================================
          SMALL PARKS / PLAZAS
      ============================================================ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[120, 0.02, 65]} receiveShadow>
        <circleGeometry args={[10, 24]} />
        <meshStandardMaterial color="#2f6b30" roughness={0.95} />
      </mesh>
      <mesh position={[120, 1.6, 65]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 3.2, 12]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.8} />
      </mesh>
      <mesh position={[120, 3.4, 65]} castShadow>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshPhysicalMaterial
          color="#bae6fd"
          metalness={0.8}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}