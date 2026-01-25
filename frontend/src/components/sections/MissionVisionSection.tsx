import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Target, Eye } from "lucide-react";

export default function MissionVisionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="relative py-20 px-4 bg-background overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto max-w-6xl" ref={ref}>
        <motion.div
          className="grid md:grid-cols-2 gap-12"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={cardVariants}>
            <GlassCard hover3d className="h-full p-8 space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-3xl font-bold text-primary">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To empower individuals worldwide with secure, fast, and reliable
                access to cryptocurrency markets. We believe everyone should
                have the opportunity to participate in the digital economy.
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            variants={{
              ...cardVariants,
              hidden: { opacity: 0, x: 30 },
            }}
          >
            <GlassCard hover3d className="h-full p-8 space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-3xl font-bold text-primary">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become the world's most trusted cryptocurrency exchange,
                setting the standard for security, innovation, and user
                experience in the digital asset industry.
              </p>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
