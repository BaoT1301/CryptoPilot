import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * About gets its own ending rather than the landing page's centred close.
 *
 * Left-aligned against a full-bleed rule, with the invitation reading as a
 * sentence rather than a slogan. Same CTA label as everywhere else, since two
 * labels for one intent is the pattern this project already had.
 */
export default function AboutClose() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-w-[20ch] text-[clamp(2rem,4.4vw,3.5rem)] font-normal leading-[1.06] tracking-[-0.04em] text-foreground"
          >
            The fastest way to understand it is to place an order.
          </motion.h2>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="lg:pb-2"
          >
            <p className="max-w-[38ch] text-base leading-relaxed text-muted-foreground">
              An account takes a few seconds and costs nothing. The funds are
              simulated, so the only thing you can lose is the argument.
            </p>
            <Link
              to="/signup"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform duration-200 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]"
            >
              Start trading
              <ArrowUpRight
                size={16}
                weight="bold"
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
