import { motion } from "framer-motion";

/**
 * FadeIn Component
 * A reusable wrapper that triggers a smooth "fade up and blur in" animation
 * when the element enters the viewport.
 *
 * Props:
 * @param {React.ReactNode} children - Content to animate
 * @param {string} className - Additional CSS classes
 * @param {number} delay - Animation delay in seconds (default: 0)
 * @param {number} duration - Animation duration in seconds (default: 0.6)
 * @param {number} y - Initial Y offset in pixels (default: 30)
 * @param {number} blur - Initial blur amount in pixels (default: 10)
 * @param {boolean} once - Only animate once (default: true)
 * @param {string} direction - Animation direction: "up" | "down" | "left" | "right"
 *
 * Usage:
 * <FadeIn>
 *   <h1>Hello World</h1>
 * </FadeIn>
 *
 * <FadeIn delay={0.2} direction="left">
 *   <p>Animated paragraph</p>
 * </FadeIn>
 */
export default function FadeIn({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  y = 30,
  blur = 10,
  once = true,
  direction = "up",
}) {
  // Calculate initial position based on direction
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: y, x: 0 };
      case "down":
        return { y: -y, x: 0 };
      case "left":
        return { x: y, y: 0 };
      case "right":
        return { x: -y, y: 0 };
      default:
        return { y: y, x: 0 };
    }
  };

  const initialPosition = getInitialPosition();

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...initialPosition,
        filter: `blur(${blur}px)`,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        filter: "blur(0px)",
      }}
      viewport={{ once, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1], // Custom cubic bezier for premium feel
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeInStagger Component
 * Container for staggered children animations
 *
 * Usage:
 * <FadeInStagger>
 *   <FadeInStaggerItem>Item 1</FadeInStaggerItem>
 *   <FadeInStaggerItem>Item 2</FadeInStaggerItem>
 *   <FadeInStaggerItem>Item 3</FadeInStaggerItem>
 * </FadeInStagger>
 */
export function FadeInStagger({
  children,
  className = "",
  staggerDelay = 0.1,
  once = true,
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeInStaggerItem Component
 * Individual item within a staggered animation container
 */
export function FadeInStaggerItem({
  children,
  className = "",
  y = 30,
  blur = 10,
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: {
          opacity: 0,
          y,
          filter: `blur(${blur}px)`,
        },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            duration: 0.6,
            ease: [0.25, 0.4, 0.25, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
