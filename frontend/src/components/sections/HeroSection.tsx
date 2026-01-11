import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="min-h-[90vh] bg-gradient-to-b from-background to-card flex items-center justify-center px-4 py-20">
      <div className="container mx-auto max-w-4xl text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
          Buy, sell, and trade
          <span className="text-primary block">crypto made easy</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Start your journey into cryptocurrency trading with our secure,
          intuitive platform. Get instant access to real-time market data,
          advanced trading tools, and 24/7 AI-powered support.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
            className="border-primary text-primary hover:bg-primary/10 bg-transparent"
            asChild
          >
            <Link to="/dashboard">View Live Prices</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
