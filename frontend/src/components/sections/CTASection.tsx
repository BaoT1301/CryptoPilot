import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10" />
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* Floating shapes */}
      <div className="absolute top-10 left-20 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-float" aria-hidden="true" />
      <div className="absolute bottom-10 right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float" aria-hidden="true" style={{ animationDelay: "1.5s" }} />

      {/* Spotlight effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-50" aria-hidden="true" />

      <motion.div
        ref={ref}
        className="container relative z-10 mx-auto max-w-4xl text-center space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2
          className="text-3xl md:text-4xl font-bold"
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          Ready to Start Trading?
        </h2>
        <p className="text-lg text-muted-foreground">
          Join thousands of traders and start building your crypto portfolio
          today
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(var(--primary),0.6)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            asChild
          >
            <Link to="/signup">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
