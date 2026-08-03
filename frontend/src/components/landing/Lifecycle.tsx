import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The order lifecycle, shown as the tape rather than described in prose.
 *
 * Every state below is a real status the backend writes: open,
 * partially_filled, filled, cancelled. Nothing here is invented, and the rows
 * are labelled as an illustration rather than dressed up as live data.
 */
const ROWS = [
  { side: "buy", state: "filled", label: "matched at 0.5 BTC" },
  { side: "sell", state: "open", label: "resting on the book" },
  { side: "buy", state: "partial", label: "1.2 of 3.0 ETH" },
  { side: "sell", state: "filled", label: "matched at 12 SOL" },
  { side: "buy", state: "open", label: "waiting for price" },
  { side: "sell", state: "cancelled", label: "pulled by owner" },
  { side: "buy", state: "filled", label: "matched at 4 BNB" },
  { side: "sell", state: "partial", label: "0.4 of 1.0 BTC" },
] as const;

const STATE_STYLE: Record<string, string> = {
  filled: "text-up",
  partial: "text-foreground",
  open: "text-muted-foreground",
  cancelled: "text-down",
};

export default function Lifecycle() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-border bg-[var(--paper-sunk)]">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
        <div className="max-w-[54ch]">
          <h2 className="text-[clamp(1.9rem,3.4vw,2.9rem)] font-normal leading-[1.1] tracking-[-0.03em] text-foreground">
            Most demo exchanges just say
            <span className="italic"> filled </span>
            and move on.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Ours tracks what actually happened to your order. A partial fill
            stays partial until the rest of it matches, and the balance maths
            follows the fill, not the intention.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-xl border border-border bg-card">
          {ROWS.map((row, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.45, delay: i * 0.045, ease: EASE }}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border px-4 py-3 last:border-b-0 sm:gap-6 sm:px-6"
            >
              <span
                className={`font-mono text-[11px] uppercase tracking-[0.12em] ${
                  row.side === "buy" ? "text-up" : "text-down"
                }`}
              >
                {row.side}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {row.label}
              </span>
              <span
                className={`font-mono text-[11px] uppercase tracking-[0.12em] ${
                  STATE_STYLE[row.state]
                }`}
              >
                {row.state}
              </span>
            </motion.div>
          ))}
        </div>

        <p className="mt-4 font-mono text-[11px] text-muted-foreground">
          Illustration of the order states the engine writes.
        </p>
      </div>
    </section>
  );
}
