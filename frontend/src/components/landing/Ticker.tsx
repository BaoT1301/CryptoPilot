import { motion, useReducedMotion } from "motion/react";
import { ASSETS, formatPrice, useLiveMarket } from "./useLiveMarket";

/**
 * A continuously scrolling price band.
 *
 * The one marquee on the page, and it earns its place: it carries live prices
 * rather than decorative words, so the movement is the content.
 *
 * Seamlessness depends on two things that are easy to get subtly wrong:
 *
 * 1. The repeat unit must be self-contained. A flex `gap` between every item
 *    puts no gap after the LAST item, so the track is not an exact whole
 *    number of repeats and a -50% shift lands slightly off the boundary. Each
 *    group therefore carries its own trailing spacing (`pr-10`) instead of
 *    relying on a gap between the two groups.
 *
 * 2. One group must be wider than the viewport. If it is not, the tail of the
 *    second group arrives before the first has left and a blank stretch shows.
 *    REPEATS makes a single group comfortably wider than an ultra-wide display.
 *
 * With two identical groups, animating x by exactly -50% moves the track by
 * precisely one group width, so the frame after the loop is identical to the
 * frame before it.
 */

/** 4 assets x 8 = 32 items per group, several thousand px, wider than any display. */
const REPEATS = 8;

export default function Ticker() {
  const reduce = useReducedMotion();
  const { prices } = useLiveMarket();

  const row = ASSETS.map(({ key, name, color }) => {
    const tick = prices[key];
    return {
      key,
      name,
      color,
      price: tick.price,
      pct: tick.drift * 100,
    };
  });

  const group = Array.from({ length: REPEATS }).flatMap(() => row);

  const Group = ({ ariaHidden }: { ariaHidden?: boolean }) => (
    <div
      className="flex shrink-0 items-center gap-10 pr-10"
      aria-hidden={ariaHidden || undefined}
    >
      {group.map((item, i) => (
        <span key={i} className="flex items-center gap-2.5 whitespace-nowrap text-sm">
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-mono font-medium text-foreground">{item.key}</span>
          <span className="font-mono tabular-nums text-muted-foreground">
            {item.price ? `$${formatPrice(item.price)}` : "-"}
          </span>
          {item.price > 0 && Math.abs(item.pct) > 0.0001 && (
            <span
              className={`font-mono text-xs tabular-nums ${
                item.pct > 0 ? "text-up" : "text-down"
              }`}
            >
              {item.pct > 0 ? "+" : ""}
              {item.pct.toFixed(2)}%
            </span>
          )}
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden border-b border-border bg-[var(--paper-sunk)] py-3.5">
      <motion.div
        className="flex w-max will-change-transform"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={
          reduce
            ? undefined
            : { duration: 90, ease: "linear", repeat: Infinity }
        }
      >
        <Group />
        {/* The duplicate exists only to fill the gap the first one leaves as it
            travels, so it is hidden from assistive tech. */}
        <Group ariaHidden />
      </motion.div>
    </div>
  );
}
