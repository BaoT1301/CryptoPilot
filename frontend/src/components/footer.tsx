import { Link } from "react-router-dom";
import { GithubLogo } from "@phosphor-icons/react";
import { LogoMark } from "./brand/Logo";

/**
 * Every link here resolves to a route that exists.
 *
 * The previous footer shipped 15 links all pointing at "#", advertising an
 * API, a mobile app, a blog, careers and press that do not exist, plus dead
 * Terms of Service and Privacy Policy links. Dead legal links on a product
 * that accepts deposits are worse than no legal links, so the invented
 * sections are gone rather than restyled.
 */
const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Trading", to: "/trading" },
      { label: "Wallet", to: "/wallet" },
      { label: "History", to: "/history" },
      { label: "AI copilot", to: "/chat" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", to: "/login" },
      { label: "Create account", to: "/signup" },
      { label: "Profile", to: "/profile" },
      { label: "About", to: "/about" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-[var(--paper-sunk)]">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <LogoMark size={24} className="text-foreground" />
              <span className="text-[16px] font-medium tracking-[-0.02em] text-foreground">
                Crypto Pilot
              </span>
            </Link>
            <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
              A crypto trading platform with a real matching engine, live prices
              and an AI copilot.
            </p>
            <a
              href="https://github.com/BaoT1301/CryptoPilot"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <GithubLogo size={18} weight="regular" />
              Source on GitHub
            </a>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h4 className="text-sm font-medium text-foreground">
                {column.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Crypto Pilot</p>
          {/* Stated plainly rather than buried: the platform trades simulated
              funds, and a visitor should know that before signing up. */}
          <p className="max-w-[62ch] md:text-right">
            Trading uses simulated funds. Prices are real, positions are not.
            Nothing here is financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
