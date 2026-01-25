import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Users, Target, Lightbulb, type LucideIcon } from "lucide-react";

interface Value {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function CoreValuesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const values: Value[] = [
    {
      icon: Users,
      title: "Customer First",
      description:
        "We prioritize our users' needs and security above all else, ensuring a seamless trading experience.",
    },
    {
      icon: Target,
      title: "Innovation",
      description:
        "Constantly pushing boundaries with cutting-edge technology to revolutionize crypto trading.",
    },
    {
      icon: Lightbulb,
      title: "Transparency",
      description:
        "Open communication and honest practices build trust with our community of traders.",
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
    <section className="relative py-20 px-4 bg-card overflow-hidden">
      {/* Animated background */}
      <div
        className="absolute inset-0 gradient-mesh opacity-50"
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
          Our Core Values
        </motion.h2>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {values.map((value, index) => (
            <motion.div key={index} variants={cardVariants}>
              <GlassCard
                hover3d
                className="text-center space-y-4 h-full focus-within:ring-2 focus-within:ring-ring"
                tabIndex={0}
              >
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center transition-all group-hover:scale-110">
                  <value.icon
                    className="w-8 h-8 text-primary transition-transform hover:rotate-12"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-xl font-semibold">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
