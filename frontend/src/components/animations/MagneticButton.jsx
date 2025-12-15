import { useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * MagneticButton Component
 * A button that subtly follows the user's cursor with physics-based attraction
 *
 * Props:
 * @param {React.ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 * @param {number} strength - Magnetic strength (default: 0.3, range: 0-1)
 * @param {number} radius - Activation radius in pixels (default: 150)
 * @param {function} onClick - Click handler
 * @param {string} as - Element type: "button" | "a" | "div" (default: "button")
 * @param {object} ...props - Additional props passed to the element
 *
 * Usage:
 * <MagneticButton className="px-6 py-3 bg-white text-black rounded-full">
 *   Click Me
 * </MagneticButton>
 *
 * <MagneticButton as="a" href="/contact" strength={0.5}>
 *   Contact Us
 * </MagneticButton>
 */
export default function MagneticButton({
  children,
  className = "",
  strength = 0.3,
  radius = 150,
  onClick,
  as = "button",
  ...props
}) {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Calculate distance from center
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // Only apply magnetic effect within radius
    if (distance < radius) {
      // Stronger effect as cursor gets closer
      const magneticStrength = strength * (1 - distance / radius);
      setPosition({
        x: distanceX * magneticStrength,
        y: distanceY * magneticStrength,
      });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const MotionComponent = motion[as] || motion.button;

  return (
    <MotionComponent
      ref={buttonRef}
      className={`relative inline-block cursor-pointer ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      animate={{
        x: position.x,
        y: position.y,
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 15,
        mass: 0.5,
      }}
      {...props}
    >
      {/* Inner content with subtle counter-movement for depth */}
      <motion.span
        className="relative z-10 block"
        animate={{
          x: position.x * 0.2,
          y: position.y * 0.2,
        }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 15,
          mass: 0.3,
        }}
      >
        {children}
      </motion.span>
    </MotionComponent>
  );
}

/**
 * MagneticIconButton Component
 * A circular magnetic button optimized for icons
 */
export function MagneticIconButton({
  children,
  className = "",
  strength = 0.4,
  size = "md",
  onClick,
  ...props
}) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
    xl: "w-16 h-16",
  };

  return (
    <MagneticButton
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full
        bg-white/10 backdrop-blur-sm
        border border-white/20
        hover:bg-white/20
        transition-colors duration-300
        ${className}
      `}
      strength={strength}
      onClick={onClick}
      {...props}
    >
      {children}
    </MagneticButton>
  );
}
