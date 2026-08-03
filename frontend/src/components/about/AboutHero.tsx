import { motion, useReducedMotion } from "motion/react";
import LivePill from "./LivePill";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Centred manifesto hero. The landing page hero is asymmetric with a live data
 * panel, so this one is deliberately a different layout family: here the
 * message is the whole composition.
 */
export default function AboutHero() {
  const reduce = useReducedMotion();

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: EASE },
        };

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 pt-24 pb-20 md:px-10 md:pt-28 md:pb-28">
        <motion.h1
          {...rise(0)}
          className="max-w-[18ch] text-[clamp(2.5rem,5.4vw,4.25rem)] font-normal leading-[1.04] tracking-[-0.04em] text-foreground"
        >
          Most crypto demos fake the{" "}
          <motion.span
            className="marker italic"
            initial={reduce ? false : ({ "--marker-scale": 0 } as never)}
            animate={{ "--marker-scale": 1 } as never}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
          >
            <span>hard part</span>
          </motion.span>
          .
        </motion.h1>

        <motion.p
          {...rise(0.08)}
          className="mt-7 max-w-[58ch] text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          Prices are canned, every order fills instantly, and the balance is a
          number in local storage. Crypto Pilot runs the real mechanics on
          simulated money: a live feed, a matching engine that can leave your
          order half filled, and books that follow the fill rather than the
          intention.
        </motion.p>

        {/* Live proof, not a claim. The same socket the product runs on. */}
        <motion.div {...rise(0.16)} className="mt-9">
          <LivePill />
        </motion.div>
      </div>
    </section>
  );
}
