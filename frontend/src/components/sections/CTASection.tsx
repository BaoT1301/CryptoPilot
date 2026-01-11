import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary/20 to-primary/10">
      <div className="container mx-auto max-w-4xl text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Start Trading?
        </h2>
        <p className="text-lg text-muted-foreground">
          Join thousands of traders and start building your crypto portfolio
          today
        </p>
        <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
          <Link to="/signup">
            Create Free Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
