import { motion, useInView } from "framer-motion";
import { TrendingUp, Shield, Zap, Bot } from "lucide-react";
import { useRef } from "react";
import GlassCard from "@/components/ui/GlassCard";

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: TrendingUp,
      title: "Real-Time Trading",
      description:
        "Execute market and limit orders instantly with our advanced matching engine",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Bank-level security with multi-factor authentication and encrypted transactions",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Order execution in milliseconds with WebSocket real-time updates",
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description:
        "Get portfolio insights and trading advice from our AI-powered assistant",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
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
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          Why Choose Crypto Pilot?
        </motion.h2>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={cardVariants}>
              <GlassCard
                hover3d
                className="text-center space-y-4 h-full focus-within:ring-2 focus-within:ring-ring"
                tabIndex={0}
              >
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center transition-all group-hover:scale-110">
                  <feature.icon
                    className="w-8 h-8 text-primary transition-transform hover:rotate-12"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
