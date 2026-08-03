import { motion, useReducedMotion } from "motion/react";
import {
  ChartLineUp,
  Notebook,
  Wallet as WalletIcon,
  Sparkle,
} from "@phosphor-icons/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Everything listed here maps to a shipped route. No roadmap items, no
 * invented metrics. The previous landing page claimed "$2.5B+ traded" and
 * "50K+ active traders", both fabricated.
 */
const ITEMS = [
  {
    Icon: ChartLineUp,
    title: "Market and limit orders",
    body: "Limit orders rest on the book until price reaches them. Market orders fill against whatever is resting.",
  },
  {
    Icon: Notebook,
    title: "A real matching engine",
    body: "Orders match against other users, not a simulator. Partial fills are tracked as partial fills.",
  },
  {
    Icon: WalletIcon,
    title: "Portfolio and history",
    body: "Positions valued against the live feed, with every fill written to an auditable history.",
  },
  {
    Icon: Sparkle,
    title: "An AI copilot",
    body: "Ask about your positions in plain language. It reads your actual portfolio, not a generic prompt.",
  },
];

export default function Capabilities() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
        <h2 className="max-w-[20ch] text-[clamp(1.9rem,3.4vw,2.9rem)] font-normal leading-[1.1] tracking-[-0.03em] text-foreground">
          Four things, built properly.
        </h2>

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
              className="border-t border-border pt-6"
            >
              <Icon size={22} weight="light" className="text-foreground" />
              <h3 className="mt-4 text-base font-medium tracking-[-0.01em] text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
