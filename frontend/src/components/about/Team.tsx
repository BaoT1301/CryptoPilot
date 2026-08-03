import { motion, useReducedMotion } from "motion/react";
import { Plus } from "@phosphor-icons/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Team.
 *
 * The previous version listed five invented executives with fabricated
 * credentials at Goldman Sachs, Coinbase, Binance and Kraken, illustrated with
 * DiceBear cartoon avatars pulled from a third-party API. Naming real
 * employers for people who do not exist, on a product that accepts deposits,
 * is a liability rather than a copy problem.
 *
 * Real people are listed as real people. Everything else is an open slot,
 * marked as open. To add someone, move them from OPEN_ROLES into MEMBERS.
 */
const MEMBERS = [
  {
    name: "Bao Tran",
    // Edit freely: this is the one place a title is claimed.
    role: "Founder",
    note: "Built the platform, from the matching engine to this page.",
  },
];

const OPEN_ROLES = ["Engineering", "Design", "Operations", "Product"];

function Monogram({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    // Rendered locally rather than fetched. The old avatars were cartoon SVGs
    // from an external API, which is a network dependency and a privacy leak
    // on a page that does not need either.
    <div className="flex size-12 items-center justify-center rounded-full border border-border bg-[var(--paper-sunk)]">
      <span className="font-mono text-sm tracking-tight text-foreground">
        {initials}
      </span>
    </div>
  );
}

export default function Team() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
        <h2 className="max-w-[18ch] text-[clamp(1.9rem,3.4vw,2.9rem)] font-normal leading-[1.1] tracking-[-0.03em] text-foreground">
          A small team, and some space.
        </h2>
        <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
          Crypto Pilot is early. Rather than pad this page out, here is who is
          actually on it and what is still open.
        </p>

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {MEMBERS.map((member, i) => (
            <motion.div
              key={member.name}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <Monogram name={member.name} />
              <h3 className="mt-5 text-base font-medium text-foreground">
                {member.name}
              </h3>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--brand)]">
                {member.role}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {member.note}
              </p>
            </motion.div>
          ))}

          {OPEN_ROLES.map((role, i) => (
            <motion.div
              key={role}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.6,
                delay: (MEMBERS.length + i) * 0.07,
                ease: EASE,
              }}
              className="rounded-xl border border-dashed border-border p-6"
            >
              <div className="flex size-12 items-center justify-center rounded-full border border-dashed border-border">
                <Plus size={16} weight="light" className="text-muted-foreground" />
              </div>
              <h3 className="mt-5 text-base font-medium text-muted-foreground">
                {role}
              </h3>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70">
                Open
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                This seat is unfilled.
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
