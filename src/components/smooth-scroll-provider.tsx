"use client";

import { useEffect } from "react";
import Lenis from "lenis";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
  options?: {
    duration?: number;
    touchMultiplier?: number;
    orientation?: "vertical" | "horizontal";
    gestureOrientation?: "vertical" | "horizontal" | "both";
  };
}

export default function SmoothScrollProvider({
  children,
  options,
}: SmoothScrollProviderProps) {
  useEffect(() => {
    // Premium easing function for amazing smoothness
    const premiumEasing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

    // Premium Lenis configuration for amazing smoothness
    const lenis = new Lenis({
      duration: options?.duration ?? 1.2, // Smooth duration (higher = smoother but slower)
      easing: premiumEasing, // Premium easing function
      orientation: options?.orientation ?? "vertical",
      gestureOrientation: options?.gestureOrientation ?? "vertical",
      smoothWheel: true, // Enable smooth wheel scrolling
      wheelMultiplier: 1, // Wheel scroll speed
      touchMultiplier: options?.touchMultiplier ?? 2, // Touch scroll speed multiplier
    } as any); // Type assertion for premium easing option

    // Premium smooth scroll animation loop
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, [options]);

  return <>{children}</>;
}

