"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { AnimationAction, AnimationMixer } from "three";

interface Params {
  actions: Record<string, AnimationAction | null>;
  mixer: AnimationMixer;
  velocityRef?: React.MutableRefObject<THREE.Vector3>;
}

/**
 * Expects clip names like: idle, walk, run, jump, fall.
 * Adjust the resolver below if your GLTF uses different names
 * (e.g. Mixamo exports "mixamo.com" — rename them in Blender
 * or override here).
 */
export function usePlayerAnimations({ actions, mixer, velocityRef }: Params) {
  const currentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!mixer) return;

    // Auto-play the first clip if none match
    const first = Object.values(actions).find(Boolean);
    if (first) first.play();

    return () => {
      Object.values(actions).forEach((a) => a?.stop());
    };
  }, [actions, mixer]);

  useEffect(() => {
    if (!mixer || !velocityRef) return;

    let frameId: number;
    const state = {
      current: "" as "" | "idle" | "walk" | "run" | "jump" | "fall",
    };

    const fadeTo = (name: keyof typeof actions, dur = 0.25) => {
      if (state.current === name) return;
      const next = actions[name];
      const prev = state.current ? actions[state.current] : null;
      if (!next) return;

      next.reset().setEffectiveWeight(1).fadeIn(dur).play();
      prev?.fadeOut(dur);
      state.current = name as any;
    };

    const tick = () => {
      const v = velocityRef.current;
      const speed = Math.hypot(v.x, v.z);
      const vy = v.y;

      if (vy > 1.5 && actions.jump) {
        fadeTo("jump", 0.15);
      } else if (vy < -2 && actions.fall) {
        fadeTo("fall", 0.2);
      } else if (speed > 5.5 && actions.run) {
        fadeTo("run", 0.2);
      } else if (speed > 0.4 && actions.walk) {
        fadeTo("walk", 0.2);
      } else {
        fadeTo("idle", 0.3);
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [actions, mixer, velocityRef]);
}