import { motion, useReducedMotion } from "motion/react";
import { ASSETS, formatPrice, useLiveMarket } from "./useLiveMarket";

/**
 * A continuously scrolling price band.
 *
 * The one marquee on the page, and it earns its place: it carries live prices
 * rather than decorative words, so the movement is the content. The track is
 * duplicated once and translated by exactly -50%, which makes the loop seamless
 * without measuring anything.
 *
 * Under reduced motion the animation is dropped and the row simply sits still,
 * still showing real prices.
 */
export default function Ticker() {
  const reduce = useReducedMotion();
  const { prices } = useLiveMarket();

  const row = ASSETS.map(({ key, name, color }) => {
    const tick = prices[key];
    const pct = tick.drift * 100;
    return { key, name, color, price: tick.price, pct };
  });

  const track = [...row, ...row, ...row, ...row];

  return (
    <div className="overflow-hidden border-b border-border bg-[var(--paper-sunk)] py-3.5">
      <motion.div
        className="flex w-max gap-10 whitespace-nowrap will-change-transform"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={
          reduce
            ? undefined
            : { duration: 38, ease: "linear", repeat: Infinity }
        }
      >
        {track.map((item, i) => (
          <span key={i} className="flex items-center gap-2.5 text-sm">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-mono font-medium text-foreground">
              {item.key}
            </span>
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
      </motion.div>
    </div>
  );
}
