"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScrolling({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2, // Durasi scroll (makin gede makin 'berat' cinematic)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Fisika Exponential (Setajam Apple)
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true, // Smooth buat Mouse
      touchMultiplier: 2, // Biar di HP responsif (gak berat)
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
