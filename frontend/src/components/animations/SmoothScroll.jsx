import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * SmoothScroll Provider
 * Wraps your app with Lenis for buttery-smooth inertia scrolling
 *
 * Usage:
 * <SmoothScroll>
 *   <YourApp />
 * </SmoothScroll>
 */
export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis with premium settings
    const lenis = new Lenis({
      duration: 1.2, // Scroll duration (higher = smoother)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Ease out expo
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Animation frame loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Expose lenis to window for debugging (optional)
    if (typeof window !== "undefined") {
      window.lenis = lenis;
    }

    // Cleanup
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}

/**
 * Hook to access Lenis instance
 * Useful for programmatic scroll control
 */
export function useLenis() {
  return typeof window !== "undefined" ? window.lenis : null;
}
