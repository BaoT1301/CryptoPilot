import { motion, useReducedMotion } from "motion/react";
import {
  ASSETS,
  formatPrice,
  useLiveMarket,
} from "@/components/landing/useLiveMarket";

/**
 * A single inline row of live prices.
 *
 * The claim directly above it is "we run the real mechanics", so the page
 * shows the feed rather than asserting it. Same socket the product uses.
 */
export default function LivePill() {
  const reduce = useReducedMotion();
  const { prices, connected } = useLiveMarket();

  return (
    <div className="inline-flex flex-wrap items-center gap-x-5 gap-y-2 rounded-full border border-border bg-card px-5 py-3">
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full ${
            connected ? "bg-[var(--market-up)]" : "bg-muted-foreground/40"
          }`}
        />
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {connected ? "live" : "connecting"}
        </span>
      </span>

      {ASSETS.map(({ key, color }) => {
        const tick = prices[key];
        return (
          <span key={key} className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-xs font-medium text-foreground">
              {key}
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
              animate={{ color: "var(--muted-foreground)" }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="font-mono text-xs tabular-nums text-muted-foreground"
            >
              {tick.price ? `$${formatPrice(tick.price)}` : "-"}
            </motion.span>
          </span>
        );
      })}
    </div>
  );
}
