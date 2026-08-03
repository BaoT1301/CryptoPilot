import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * What the thing is made of.
 *
 * Replaces the old stats band, which rendered "$2.5B Total Volume", "50K+
 * Active Users", "Founded 2,019" (an unformatted year run through a thousands
 * separator) and "24/7 Support" for a product with none of those. Real
 * specifics are more convincing than invented scale, and they are also true.
 */
/** `tint` picks the swatch for each row so the grid is not six identical cards. */
const ROWS = [
  {
    label: "Price feed",
    value: "Binance websocket",
    note: "Streamed to every open tab over our own socket, no polling.",
    tint: "var(--asset-btc)",
  },
  {
    label: "Matching",
    value: "In-process engine",
    note: "Limit orders rest on the book. Market orders take from it.",
    tint: "var(--market-up)",
  },
  {
    label: "Backend",
    value: "Express, TypeScript",
    note: "Mongoose over a MongoDB replica set, with real transactions.",
    tint: "var(--asset-eth)",
  },
  {
    label: "Auth",
    value: "JWT, argon2",
    note: "Short-lived access tokens with refresh held in httpOnly cookies.",
    tint: "var(--asset-sol)",
  },
  {
    label: "Copilot",
    value: "OpenAI",
    note: "Prompted with your live positions, not a generic assistant.",
    tint: "var(--brand)",
  },
  {
    label: "Funds",
    value: "Simulated",
    note: "Prices are real. Balances are not. Nothing is custodied.",
    tint: "var(--market-down)",
  },
];

export default function Stack() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-border bg-[var(--paper-sunk)]">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
        <h2 className="max-w-[20ch] text-[clamp(1.9rem,3.4vw,2.9rem)] font-normal leading-[1.1] tracking-[-0.03em] text-foreground">
          What it is made of.
        </h2>

        <dl className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {ROWS.map((row, i) => (
            <motion.div
              key={row.label}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: EASE }}
              whileHover={reduce ? undefined : { y: -3 }}
              className="group relative rounded-xl border border-border bg-card p-6 transition-colors duration-200 hover:border-foreground/20"
            >
              {/* The swatch is the only colour in the cell, so six cells read as
                  six things rather than one repeated card. */}
              <span
                aria-hidden
                className="block h-1 w-8 rounded-full transition-all duration-300 group-hover:w-14"
                style={{ backgroundColor: row.tint }}
              />
              <dt className="mt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-2 text-lg font-normal tracking-[-0.02em] text-foreground">
                {row.value}
              </dd>
              <dd className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {row.note}
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
