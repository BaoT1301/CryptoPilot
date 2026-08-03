import { useState } from "react";

interface FloatingOrbsProps {
  count?: number;
}

function generateOrbs(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 300 + 200,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
  }));
}

export default function FloatingOrbs({ count = 3 }: FloatingOrbsProps) {
  const [orbs] = useState(() => generateOrbs(count));

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full blur-3xl animate-gradient"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            background: `radial-gradient(circle, oklch(0.65 0.22 262 / 0.3) 0%, transparent 70%)`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
