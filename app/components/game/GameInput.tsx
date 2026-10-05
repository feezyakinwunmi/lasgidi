"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __lasgidiEnterPressed?: boolean;
  }
}

export default function GameInput() {
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code === "KeyE") {
        window.__lasgidiEnterPressed = true;
      }
    };

    const up = (event: KeyboardEvent) => {
      if (event.code === "KeyE") {
        window.__lasgidiEnterPressed = false;
      }
    };

    window.addEventListener(
      "keydown",
      down
    );

    window.addEventListener(
      "keyup",
      up
    );

    return () => {
      window.removeEventListener(
        "keydown",
        down
      );

      window.removeEventListener(
        "keyup",
        up
      );
    };
  }, []);

  return null;
}