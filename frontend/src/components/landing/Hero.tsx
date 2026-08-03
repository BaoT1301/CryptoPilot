import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, ArrowDown, ArrowUp } from "@phosphor-icons/react";
import { ASSETS, formatPrice, useLiveMarket } from "./useLiveMarket";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Asymmetric hero: message left, live market right.
 *
 * The reference set (Wispr, Littlebird, LemonLime, Lemma) all centre their
 * heroes, but all four also carry a real product visual. Ours is the actual
 * price feed, which reads better beside the copy than under it, and it gives
 * the composition the asymmetry a centred stack would lose.
 */
export default function Hero() {
  const reduce = useReducedMotion();
  const { prices, connected } = useLiveMarket();

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: EASE },
        };

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 pt-20 pb-16 md:px-10 lg:pt-24 lg:pb-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          {/* Message */}
          <div>
            <motion.h1
              {...rise(0)}
              className="max-w-[13ch] text-[clamp(2.75rem,6.2vw,5rem)] font-normal leading-[1.02] tracking-[-0.04em] text-foreground"
            >
              Trade crypto on a
              <span className="italic"> real </span>
              order book.
            </motion.h1>

            <motion.p
              {...rise(0.08)}
              className="mt-6 max-w-[46ch] text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              Live prices straight from the exchange, a matching engine that
              actually fills your orders, and an AI copilot that reads your
              positions.
            </motion.p>

            <motion.div
              {...rise(0.16)}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform duration-200 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]"
              >
                Start trading
                <ArrowUpRight
                  size={16}
                  weight="bold"
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center rounded-full border border-border px-6 py-3.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-secondary"
              >
                How it works
              </Link>
            </motion.div>
          </div>

          {/* Live market. Real data from the same socket the app uses. */}
          <motion.div
            {...(reduce
              ? {}
              : {
                  initial: { opacity: 0, y: 24 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.9, delay: 0.2, ease: EASE },
                })}
            className="rounded-xl border border-border bg-card"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Live market
              </span>
              <span className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${
                    connected ? "bg-[var(--market-up)]" : "bg-muted-foreground/40"
                  }`}
                />
                {connected ? "streaming" : "connecting"}
              </span>
            </div>

            <ul>
              {ASSETS.map(({ key, name }) => {
                const tick = prices[key];
                return (
                  <li
                    key={key}
                    className="flex items-baseline justify-between border-b border-border px-5 py-4 last:border-b-0"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-sm font-medium text-foreground">
                        {key}
                      </span>
                      <span className="text-sm text-muted-foreground">{name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {tick.dir !== 0 && (
                        <motion.span
                          key={`${key}-${tick.price}`}
                          initial={reduce ? false : { opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          className={tick.dir === 1 ? "text-up" : "text-down"}
                          aria-hidden
                        >
                          {tick.dir === 1 ? (
                            <ArrowUp size={12} weight="bold" />
                          ) : (
                            <ArrowDown size={12} weight="bold" />
                          )}
                        </motion.span>
                      )}
                      {/* Keying on price replays the flash on every tick, so the
                          number itself signals movement without a separate badge. */}
                      <motion.span
                        key={`${key}-p-${tick.price}`}
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
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="px-5 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
              Prices stream from Binance over our own websocket. Not a mockup.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
