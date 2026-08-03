import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import GlassCard from "@/components/ui/GlassCard";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string[];
}

export default function TeamSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const teamMembers: TeamMember[] = [
    {
      name: "Sarah Johnson",
      role: "CEO & Co-Founder",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      description: [
        "15+ years in fintech and blockchain technology",
        "Former VP at Goldman Sachs Digital Assets",
        "Harvard MBA, Stanford Computer Science",
        "Pioneer in cryptocurrency regulatory compliance",
      ],
    },
    {
      name: "Michael Chen",
      role: "CTO & Co-Founder",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      description: [
        "Expert in distributed systems and blockchain",
        "Led engineering at Coinbase and Binance",
        "PhD in Computer Science from MIT",
        "Built high-frequency trading systems at scale",
      ],
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      description: [
        "10+ years designing trading platforms",
        "Previously at Robinhood and Square",
        "UX expert with focus on accessibility",
        "Led product teams at Fortune 500 companies",
      ],
    },
    {
      name: "David Kim",
      role: "Head of Security",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      description: [
        "Cybersecurity expert with 12+ years experience",
        "Former security lead at Kraken Exchange",
        "Certified Ethical Hacker (CEH)",
        "Specializes in crypto wallet security",
      ],
    },
    {
      name: "Lisa Anderson",
      role: "Head of Operations",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
      description: [
        "Operations excellence in fintech for 15+ years",
        "Built trading operations at major exchanges",
        "Expert in regulatory compliance and KYC/AML",
        "MBA from Wharton School of Business",
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
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
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Meet Our Team
          </h2>
          <p className="text-lg text-muted-foreground">
            Led by industry veterans with decades of combined experience
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {teamMembers.map((member, index) => (
            <motion.div key={index} variants={cardVariants}>
              <GlassCard className="h-full space-y-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse-glow" />
                    <img
                      src={member.image}
                      alt={member.name}
                      className="relative w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-sm text-primary font-medium">
                      {member.role}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {member.description.map((point, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
