import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Lightbulb } from "lucide-react";

export default function About() {
  const teamMembers = [
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

  const values = [
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">About MyCoinBase</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We're on a mission to make cryptocurrency trading accessible,
            secure, and efficient for everyone. Our platform combines
            cutting-edge technology with user-friendly design to deliver the
            best trading experience.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-primary">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To empower individuals worldwide with secure, fast, and reliable
                access to cryptocurrency markets. We believe everyone should
                have the opportunity to participate in the digital economy.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-primary">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become the world's most trusted cryptocurrency exchange,
                setting the standard for security, innovation, and user
                experience in the digital asset industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-2">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground">
              Led by industry veterans with decades of combined experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="border-2 hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6 space-y-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full bg-primary/10"
                    />
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">2019</div>
              <div className="text-muted-foreground">Founded</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">$2.5B</div>
              <div className="text-muted-foreground">Total Volume</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
