"use client";

import { Canvas } from "@react-three/fiber";
import {
Environment,
KeyboardControls,
} from "@react-three/drei";
import { Physics, RapierRigidBody } from "@react-three/rapier";
import { useRef, useState } from "react";

import LagosWorld from "./LagosWorld";
import Player from "./Player";
import Vehicle from "./Vehicle";

const controls = [
{
name: "forward",
keys: ["ArrowUp", "KeyW"],
},
{
name: "backward",
keys: ["ArrowDown", "KeyS"],
},
{
name: "left",
keys: ["ArrowLeft", "KeyA"],
},
{
name: "right",
keys: ["ArrowRight", "KeyD"],
},
{
name: "sprint",
keys: ["ShiftLeft", "ShiftRight"],
},
{
name: "enter",
keys: ["KeyE"],
},
];

export default function GameCanvas() {
const playerRef = useRef<RapierRigidBody | null>(null);

const drivingRef = useRef(false);

const [driving, setDriving] = useState(false);

const handleEnterVehicle = () => {
drivingRef.current = true;
setDriving(true);
};

const handleExitVehicle = () => {
drivingRef.current = false;
setDriving(false);
};

return ( <div className="relative h-full w-full"> <KeyboardControls map={controls}>
<Canvas
shadows
dpr={[1, 2]}
camera={{
position: [0, 5, 11],
fov: 72,
near: 0.1,
far: 400,
}}
gl={{
antialias: true,
powerPreference: "high-performance",
}}
>
<color
attach="background"
args={["#8da8b8"]}
/>


      <fog
        attach="fog"
        args={["#8da8b8", 45, 180]}
      />

      <ambientLight intensity={1.35} />

      <directionalLight
        position={[30, 40, 20]}
        intensity={3.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />

      <hemisphereLight
        args={[
          "#b9d7e8",
          "#43513d",
          1.1,
        ]}
      />

      <Environment preset="city" />

      <Physics gravity={[0, -9.81, 0]}>
        <LagosWorld />

        <Player
          playerRef={playerRef}
          driving={driving}
        />

        <Vehicle
          playerRef={playerRef}
          drivingRef={drivingRef}
          driving={driving}
          onEnter={handleEnterVehicle}
          onExit={handleExitVehicle}
        />
      </Physics>
    </Canvas>
  </KeyboardControls>

  {!driving && (
    <>
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="h-1.5 w-1.5 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-5 py-2 text-xs text-white/60 backdrop-blur-md">
        Click to look around · WASD to move · Shift to run
      </div>
    </>
  )}

  {driving && (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-5 py-2 text-xs text-white/70 backdrop-blur-md">
      W / S to drive · A / D to steer · E to exit
    </div>
  )}
</div>


);
}
