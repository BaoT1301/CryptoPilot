import { Mail, Github, Twitter } from "lucide-react";

const footerSections = [
  {
    title: "Product",
    links: ["Buy & Sell", "Trading", "Wallet", "API", "Mobile App"],
  },
  {
    title: "Company",
    links: ["About Us", "Blog", "Careers", "Press", "Contact"],
  },
  {
    title: "Legal",
    links: [
      "Terms of Service",
      "Privacy Policy",
      "Cookie Policy",
      "Security",
      "Compliance",
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">₿</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                Crypto Pilot
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The easiest way to buy, sell, and trade cryptocurrency.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h4 className="font-bold text-foreground">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 Crypto Pilot. All rights reserved.</p>
          <p>
            Disclaimer: Cryptocurrency trading involves risk. Please do your own
            research before investing.
          </p>
        </div>
      </div>
    </footer>
  );
}
