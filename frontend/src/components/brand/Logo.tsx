import { motion, useReducedMotion } from "motion/react";

/**
 * Crypto Pilot mark.
 *
 * A compass needle, not a coin glyph. "Pilot" is the half of the name worth
 * owning: every crypto product draws a B, a chain link, or a candlestick, and
 * the previous mark was a literal Bitcoin character in a rounded box.
 *
 * The needle is split down its axis so the two halves carry different weight,
 * the way a real compass needle is painted. The lit half uses the brand amber,
 * which is the only place the accent appears in the header. Silhouette stays
 * legible down to 16px because it is a single convex shape.
 */
export function LogoMark({
  size = 28,
  className = "",
  animate = false,
}: {
  size?: number;
  className?: string;
  animate?: boolean;
}) {
  const reduce = useReducedMotion();
  const spin = animate && !reduce;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
      {...(spin
        ? {
            initial: { rotate: -14, opacity: 0, scale: 0.9 },
            animate: { rotate: 0, opacity: 1, scale: 1 },
            transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
          }
        : {})}
    >
      {/* Bezel. A hairline ring reads as an instrument housing and keeps the
          mark from floating when it sits next to the wordmark. */}
      <circle
        cx="16"
        cy="16"
        r="14.25"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />

      {/* Shadowed half of the needle. */}
      <path d="M16 3.4 L16 28.6 L8.6 16.4 Z" fill="currentColor" fillOpacity="0.35" />

      {/* Lit half. */}
      <path d="M16 3.4 L23.4 16.4 L16 28.6 Z" fill="var(--brand)" />

      {/* Hub. */}
      <circle cx="16" cy="16.4" r="1.9" fill="var(--paper)" />
      <circle
        cx="16"
        cy="16.4"
        r="1.9"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
    </motion.svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={26} className="text-foreground" />
      <span className="text-[17px] font-medium tracking-[-0.02em] text-foreground">
        Crypto Pilot
      </span>
    </span>
  );
}
