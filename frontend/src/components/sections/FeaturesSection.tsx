import { TrendingUp, Shield, Zap, Bot } from "lucide-react";

export default function FeaturesSection() {
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

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Choose MyCoinBase?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
