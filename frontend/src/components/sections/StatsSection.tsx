import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    {
      value: 2.5,
      suffix: "B+",
      prefix: "$",
      label: "Total Volume Traded",
      decimals: 1,
    },
    {
      value: 50,
      suffix: "K+",
      label: "Active Traders",
      decimals: 0,
    },
    {
      value: 4,
      suffix: "",
      label: "Cryptocurrencies",
      decimals: 0,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="relative py-20 px-4 bg-card overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-mesh opacity-50" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse-glow" aria-hidden="true" />

      <div className="container relative z-10 mx-auto max-w-6xl" ref={ref}>
        <motion.div
          className="grid md:grid-cols-3 gap-8 text-center"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="space-y-2"
            >
              <div
                className="text-4xl md:text-5xl font-bold text-primary mb-2 tabular-nums"
                role="status"
                aria-live="polite"
              >
                {isInView ? (
                  <AnimatedCounter
                    end={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                    decimals={stat.decimals}
                    duration={2.5}
                  />
                ) : (
                  <span>
                    {stat.prefix}0{stat.suffix}
                  </span>
                )}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
