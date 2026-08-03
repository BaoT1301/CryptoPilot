import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import FloatingOrbs from "@/components/ui/FloatingOrbs";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card" />
      <div className="absolute inset-0 gradient-mesh" />

      {/* Floating orbs */}
      <FloatingOrbs count={4} />

      {/* Decorative floating elements */}
      <div
        className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"
        aria-hidden="true"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-float"
        aria-hidden="true"
        style={{ animationDelay: "2s" }}
      />

      {/* Content */}
      <motion.div
        className="container relative z-10 mx-auto max-w-4xl text-center space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-foreground leading-tight"
          variants={itemVariants}
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          Buy, Sell, and Trade
          <span className="text-primary block text-glow">Crypto Made Easy</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          Start your journey into cryptocurrency trading with our secure,
          intuitive platform. Get instant access to real-time market data,
          advanced trading tools, and 24/7 AI-powered support.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          variants={itemVariants}
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            asChild
          >
            <Link to="/signup">
              Start Trading Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 bg-transparent transition-all hover:scale-105 hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            asChild
          >
            <Link to="/dashboard">View Live Prices</Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        aria-hidden="true"
      >
        <ChevronDown className="w-6 h-6 text-muted-foreground animate-bounce-slow" />
      </motion.div>
    </section>
  );
}
