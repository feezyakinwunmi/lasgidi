"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ============================================================================
   PIECES
============================================================================ */

function BridgeDeck({
  position,
  width,
  length,
  rotation = [0, 0, 0],
}: {
  position: Vec3;
  width: number;
  length: number;
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation as any}>
      {/* Main deck slab */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, 0.7, length]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>

      {/* Asphalt surface */}
      <mesh position={[0, 0.38, 0]} receiveShadow>
        <boxGeometry args={[width - 0.5, 0.06, length]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.95} />
      </mesh>

      {/* Center dashed marking */}
      {Array.from({ length: Math.floor(length / 4) }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.42, -length / 2 + 2 + i * 4]}
        >
          <boxGeometry args={[0.16, 0.02, 2]} />
          <meshStandardMaterial color="#f1f5f9" />
        </mesh>
      ))}

      {/* Edge curbs */}
      <mesh position={[width / 2 - 0.25, 0.55, 0]}>
        <boxGeometry args={[0.5, 0.25, length]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.85} />
      </mesh>
      <mesh position={[-width / 2 + 0.25, 0.55, 0]}>
        <boxGeometry args={[0.5, 0.25, length]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.85} />
      </mesh>

      {/* Guardrails */}
      <mesh position={[width / 2 - 0.25, 1.3, 0]} castShadow>
        <boxGeometry args={[0.1, 1.4, length]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[-width / 2 + 0.25, 1.3, 0]} castShadow>
        <boxGeometry args={[0.1, 1.4, length]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Expansion joints every 20m */}
      {Array.from({ length: Math.floor(length / 20) + 1 }).map((_, i) => {
        const z = -length / 2 + i * 20;
        if (Math.abs(z) > length / 2) return null;
        return (
          <mesh key={i} position={[0, 0.41, z]}>
            <boxGeometry args={[width - 0.6, 0.02, 0.18]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
        );
      })}

      {/* Understructure ribs */}
      {Array.from({ length: Math.floor(length / 8) }).map((_, i) => (
        <mesh
          key={`rib-${i}`}
          position={[0, -0.5, -length / 2 + 4 + i * 8]}
          castShadow
        >
          <boxGeometry args={[width - 0.5, 0.4, 0.5]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function SupportPillar({
  position,
  height,
  width = 3,
}: {
  position: Vec3;
  height: number;
  width?: number;
}) {
  return (
    <group position={position}>
      {/* Shaft */}
      <mesh position={[0, -height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, width]} />
        <meshStandardMaterial color="#8a8a8a" roughness={0.9} />
      </mesh>

      {/* Cap under deck */}
      <mesh position={[0, -0.3, 0]} castShadow>
        <boxGeometry args={[width + 0.6, 0.6, width + 0.6]} />
        <meshStandardMaterial color="#555" roughness={0.9} />
      </mesh>

      {/* Base pier */}
      <mesh position={[0, -height + 0.3, 0]} receiveShadow>
        <cylinderGeometry args={[width * 0.7, width * 0.8, 0.6, 16]} />
        <meshStandardMaterial color="#3f3f3f" roughness={0.95} />
      </mesh>
    </group>
  );
}

function BridgeLight({
  position,
}: {
  position: Vec3;
}) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 6, 8]} />
        <meshStandardMaterial color="#2a2e33" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Arm */}
      <mesh position={[0, 6, -0.6]} rotation={[Math.PI / 2.4, 0, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.3, 8]} />
        <meshStandardMaterial color="#2a2e33" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Lamp housing */}
      <mesh position={[0, 6.2, -1.2]} castShadow>
        <boxGeometry args={[0.4, 0.15, 0.35]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 6.1, -1.2]}>
        <boxGeometry args={[0.35, 0.03, 0.3]} />
        <meshStandardMaterial
          color="#fff4c2"
          emissive="#ffd27a"
          emissiveIntensity={2.5}
        />
      </mesh>
      <pointLight
        position={[0, 6, -1.2]}
        color="#ffd27a"
        intensity={10}
        distance={18}
        decay={2}
      />
    </group>
  );
}

function Pylon({
  position,
  height,
}: {
  position: Vec3;
  height: number;
}) {
  const cables = useMemo(() => {
    // Cables fan out from the top of the pylon to the deck in both directions
    const arr: THREE.Line[] = [];
    const top = new THREE.Vector3(0, height, 0);
    const deckOffsets = [-30, -22, -14, -6, 6, 14, 22, 30];
    for (const dz of deckOffsets) {
      const deckPoint = new THREE.Vector3(0, 0, dz);
      const mid = top.clone().add(deckPoint).multiplyScalar(0.5);
      mid.y -= 1.5;
      const curve = new THREE.QuadraticBezierCurve3(top, mid, deckPoint);
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(10));
      arr.push(
        new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({ color: "#d0d4d9" })
        )
      );
    }
    return arr;
  }, [height]);

  return (
    <group position={position}>
      {/* Two legs (A-frame) */}
      <mesh position={[-1, height / 2, 0]} castShadow>
        <boxGeometry args={[0.6, height, 0.6]} />
        <meshStandardMaterial color="#c4c8cc" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[1, height / 2, 0]} castShadow>
        <boxGeometry args={[0.6, height, 0.6]} />
        <meshStandardMaterial color="#c4c8cc" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Cross braces */}
      {[0.25, 0.5, 0.75].map((t) => (
        <mesh key={t} position={[0, height * t, 0]} castShadow>
          <boxGeometry args={[2.6, 0.2, 0.4]} />
          <meshStandardMaterial color="#b0b4b8" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}

      {/* Top cap */}
      <mesh position={[0, height, 0]} castShadow>
        <boxGeometry args={[3, 0.6, 1]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Aviation light */}
      <mesh position={[0, height + 0.6, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial
          color="#ff2222"
          emissive="#ff2222"
          emissiveIntensity={2.5}
        />
      </mesh>
      <pointLight
        position={[0, height + 0.6, 0]}
        color="#ff2222"
        intensity={3}
        distance={14}
      />

      {/* Cables */}
      {cables.map((c, i) => (
        <primitive key={i} object={c} />
      ))}
    </group>
  );
}

/* ============================================================================
   WATER UNDER BRIDGES
============================================================================ */

function WaterSurface({
  position,
  size,
}: {
  position: Vec3;
  size: [number, number];
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={size} />
      <meshPhysicalMaterial
        color="#0a3d54"
        roughness={0.06}
        metalness={0.25}
        transmission={0.35}
        thickness={3}
        clearcoat={1}
        clearcoatRoughness={0.04}
        transparent
        opacity={0.94}
      />
    </mesh>
  );
}

/* ============================================================================
   PUBLIC BRIDGES
============================================================================ */

export function ThirdMainlandBridge() {
  const bridgeLength = 160;
  const deckY = 5;
  const deckWidth = 16;
  const centerX = 45;

  // Support pillars along the length
  const pillars = useMemo(() => {
    const arr: Vec3[] = [];
    for (let z = -bridgeLength / 2 + 15; z <= bridgeLength / 2 - 15; z += 30) {
      arr.push([centerX, deckY - 0.35, z]);
    }
    return arr;
  }, [bridgeLength, centerX, deckY]);

  return (
    <group>
      {/* Water beneath */}
      <WaterSurface position={[centerX, -1.2, 0]} size={[200, 400]} />

      {/* Deck */}
      <BridgeDeck
        position={[centerX, deckY, 0]}
        width={deckWidth}
        length={bridgeLength}
      />

      {/* Support pillars */}
      {pillars.map((p, i) => (
        <SupportPillar
          key={`p-${i}`}
          position={p}
          height={deckY + 1.2}
          width={3.4}
        />
      ))}

      {/* Two pylons for cable-stayed look */}
      <Pylon position={[centerX, deckY + 0.7, -50]} height={20} />
      <Pylon position={[centerX, deckY + 0.7, 50]} height={20} />

      {/* Streetlights along both edges */}
      {Array.from({ length: Math.floor(bridgeLength / 20) }).map((_, i) => {
        const z = -bridgeLength / 2 + 12 + i * 20;
        return (
          <React.Fragment key={i}>
            <BridgeLight position={[centerX - deckWidth / 2 + 0.6, deckY + 0.4, z]} />
            <BridgeLight position={[centerX + deckWidth / 2 - 0.6, deckY + 0.4, z]} />
          </React.Fragment>
        );
      })}

      {/* Small barge/ship passing under */}
      <group position={[centerX - 20, -0.9, 30]} rotation={[0, 0.3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[6, 2, 14]} />
          <meshStandardMaterial color="#5b1a1a" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.5, -2]} castShadow>
          <boxGeometry args={[4, 2, 4]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.7} />
        </mesh>
        <mesh position={[0, 3, -2]}>
          <cylinderGeometry args={[0.3, 0.3, 1.5, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </group>
  );
}

export function SecondBridge() {
  const bridgeLength = 110;
  const deckY = 4;
  const deckWidth = 14;
  const centerX = 45;
  const centerZ = -70;

  const pillars = useMemo(() => {
    const arr: Vec3[] = [];
    for (
      let z = centerZ - bridgeLength / 2 + 12;
      z <= centerZ + bridgeLength / 2 - 12;
      z += 26
    ) {
      arr.push([centerX, deckY - 0.35, z]);
    }
    return arr;
  }, [bridgeLength, centerX, deckY, centerZ]);

  return (
    <group>
      {/* Deck */}
      <BridgeDeck
        position={[centerX, deckY, centerZ]}
        width={deckWidth}
        length={bridgeLength}
      />

      {/* Support pillars */}
      {pillars.map((p, i) => (
        <SupportPillar
          key={`p2-${i}`}
          position={p}
          height={deckY + 1.2}
          width={3}
        />
      ))}

      {/* One mid-span pylon */}
      <Pylon position={[centerX, deckY + 0.7, centerZ]} height={16} />

      {/* Streetlights */}
      {Array.from({ length: Math.floor(bridgeLength / 18) }).map((_, i) => {
        const z = centerZ - bridgeLength / 2 + 10 + i * 18;
        return (
          <React.Fragment key={i}>
            <BridgeLight position={[centerX - deckWidth / 2 + 0.6, deckY + 0.4, z]} />
            <BridgeLight position={[centerX + deckWidth / 2 - 0.6, deckY + 0.4, z]} />
          </React.Fragment>
        );
      })}
    </group>
  );
}

export function BridgeNetwork() {
  return (
    <group>
      <ThirdMainlandBridge />
      <SecondBridge />
    </group>
  );
}