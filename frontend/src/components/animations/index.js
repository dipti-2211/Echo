// Premium Animation Components
// Export all animation components for easy imports

export { default as SmoothScroll, useLenis } from "./SmoothScroll";
export { default as FadeIn, FadeInStagger, FadeInStaggerItem } from "./FadeIn";
export { default as MagneticButton, MagneticIconButton } from "./MagneticButton";

/**
 * Animation Presets
 * Ready-to-use animation configurations
 */
export const animationPresets = {
    // Fade variants
    fadeUp: {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    },
    fadeDown: {
        initial: { opacity: 0, y: -30 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
    },
    fadeLeft: {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -10 },
    },
    fadeRight: {
        initial: { opacity: 0, x: -30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 10 },
    },

    // Scale variants
    scaleUp: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
    },
    scaleDown: {
        initial: { opacity: 0, scale: 1.05 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.05 },
    },

    // Blur variants
    blurIn: {
        initial: { opacity: 0, filter: "blur(10px)" },
        animate: { opacity: 1, filter: "blur(0px)" },
        exit: { opacity: 0, filter: "blur(10px)" },
    },
};

/**
 * Spring Configurations
 * Physics-based spring presets
 */
export const springPresets = {
    // Bouncy and playful
    bouncy: {
        type: "spring",
        stiffness: 400,
        damping: 10,
    },
    // Smooth and elegant
    smooth: {
        type: "spring",
        stiffness: 300,
        damping: 30,
    },
    // Quick and snappy
    snappy: {
        type: "spring",
        stiffness: 500,
        damping: 25,
    },
    // Slow and luxurious
    luxury: {
        type: "spring",
        stiffness: 100,
        damping: 20,
    },
};

/**
 * Easing Functions
 * Custom cubic bezier curves for premium feel
 */
export const easings = {
    // Standard ease out
    easeOut: [0.25, 0.4, 0.25, 1],
    // Smooth ease in-out
    easeInOut: [0.65, 0, 0.35, 1],
    // Anticipation (slight pull back before motion)
    anticipate: [0.68, -0.6, 0.32, 1.6],
    // Overshoot (goes past target then settles)
    overshoot: [0.34, 1.56, 0.64, 1],
};
