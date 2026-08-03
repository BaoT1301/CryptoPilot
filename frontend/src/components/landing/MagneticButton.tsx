import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";

/**
 * A CTA that leans toward the cursor.
 *
 * Pointer position lives in motion values driven through a spring, so nothing
 * here re-renders React on mouse move. Tracking this in useState would
 * re-render the tree on every pointer event and stutter.
 *
 * Pulls at about a third of cursor offset and caps quickly, so it reads as
 * weight rather than as the button chasing the mouse. The wrapper does the
 * moving; the Link stays a plain anchor so routing and keyboard focus are
 * untouched.
 */
export default function MagneticButton({
  to,
  children,
  className = "",
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (event: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const box = ref.current.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    const limit = 9;
    x.set(Math.max(-limit, Math.min(limit, dx * 0.32)));
    y.set(Math.max(-limit, Math.min(limit, dy * 0.32)));
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="inline-flex"
    >
      <Link to={to} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}
