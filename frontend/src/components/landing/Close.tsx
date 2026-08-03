import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Closing block. Centred, which is fine here because the message is the whole
 * composition, and it is the only centred section on the page.
 *
 * Uses the same "Start trading" label as the hero. Two CTAs with the same
 * intent under different names ("Get started", "Create free account") is the
 * pattern the old page had.
 */
export default function Close() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-28 text-center md:px-10 md:py-40">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto max-w-[16ch] text-[clamp(2.25rem,5vw,4rem)] font-normal leading-[1.05] tracking-[-0.04em] text-foreground"
        >
          Open the book.
        </motion.h2>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
          className="mx-auto mt-5 max-w-[44ch] text-base leading-relaxed text-muted-foreground"
        >
          Free to use with simulated funds. No card, no KYC, nothing to install.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
          className="mt-10"
        >
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-medium text-primary-foreground transition-transform duration-200 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]"
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
    </section>
  );
}
