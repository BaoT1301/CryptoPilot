import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { LogoMark } from "@/components/brand/Logo";
import {
  ASSETS,
  formatPrice,
  useLiveMarket,
} from "@/components/landing/useLiveMarket";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Split auth layout: form on the left, live market on the right.
 *
 * A centred card on an empty page is the default for auth and says nothing.
 * Putting the real feed beside the form means the sign-up page is also the
 * proof: the prices are moving before you have an account.
 *
 * The panel is hidden below lg, where a form should have the full width.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const { prices, connected } = useLiveMarket();

  return (
    <main className="mx-auto grid min-h-[calc(100dvh-65px)] max-w-[1400px] items-stretch gap-0 px-6 md:px-10 lg:grid-cols-[1fr_0.85fr]">
      {/* Form */}
      <div className="flex items-center py-16 lg:pr-16">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="w-full max-w-[26rem]"
        >
          <Link to="/" className="inline-flex lg:hidden">
            <LogoMark size={28} className="text-foreground" />
          </Link>

          <h1 className="mt-6 text-[clamp(1.9rem,3.2vw,2.5rem)] font-normal leading-[1.1] tracking-[-0.03em] text-foreground lg:mt-0">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>

          <div className="mt-9">{children}</div>

          <div className="mt-7 text-sm text-muted-foreground">{footer}</div>
        </motion.div>
      </div>

      {/* Live market panel */}
      <aside className="hidden items-center border-l border-border pl-16 lg:flex">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
          className="w-full"
        >
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? "bg-[var(--market-up)]" : "bg-muted-foreground/40"
              }`}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {connected ? "Market is open" : "Connecting"}
            </span>
          </div>

          <ul className="mt-7 space-y-0">
            {ASSETS.map(({ key, name, color }) => {
              const tick = prices[key];
              return (
                <li
                  key={key}
                  className="flex items-center justify-between border-b border-border py-4 last:border-b-0"
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-mono text-sm font-medium text-foreground">
                      {key}
                    </span>
                    <span className="text-sm text-muted-foreground">{name}</span>
                  </span>
                  <motion.span
                    key={`${key}-${tick.price}`}
                    initial={
                      reduce || tick.dir === 0
                        ? false
                        : {
                            color:
                              tick.dir === 1
                                ? "var(--market-up)"
                                : "var(--market-down)",
                          }
                    }
                    animate={{ color: "var(--foreground)" }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    className="font-mono text-base tabular-nums text-foreground"
                  >
                    {tick.price ? `$${formatPrice(tick.price)}` : "-"}
                  </motion.span>
                </li>
              );
            })}
          </ul>

          <p className="mt-7 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
            Real prices from the exchange. Trading uses simulated funds, so
            nothing is at risk while you learn the mechanics.
          </p>
        </motion.div>
      </aside>
    </main>
  );
}
