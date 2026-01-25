import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function AboutHeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-background to-card">
      {/* Floating shapes */}
      <div
        className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-float"
        aria-hidden="true"
        style={{ animationDelay: "2s" }}
      />

      {/* Spotlight effect */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/5 via-transparent to-transparent"
        aria-hidden="true"
      />

      <motion.div
        ref={ref}
        className="container relative z-10 mx-auto max-w-4xl text-center space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          About MyCoinBase
        </motion.h1>
        <motion.p
          className="text-lg text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          We're on a mission to make cryptocurrency trading accessible, secure,
          and efficient for everyone. Our platform combines cutting-edge
          technology with user-friendly design to deliver the best trading
          experience.
        </motion.p>
      </motion.div>
    </section>
  );
}
