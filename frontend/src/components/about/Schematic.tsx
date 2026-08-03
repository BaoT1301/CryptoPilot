import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The system drawn rather than listed.
 *
 * Replaces a six-cell card grid, which is the same layout family the landing
 * page already uses for capabilities. An annotated schematic is a different
 * shape of thing entirely: hairline paths, mono callouts, a drawing you read
 * left to right. It also happens to be the honest way to explain a data flow.
 *
 * The paths draw themselves once on entry, which is motivated: the eye follows
 * the direction the data travels.
 */
const NODES = [
  {
    id: "binance",
    label: "Binance",
    sub: "ticker stream",
    x: 4,
    tint: "var(--asset-btc)",
    primary: false,
  },
  {
    id: "engine",
    label: "Matching engine",
    sub: "book, fills, balances",
    x: 36,
    tint: "var(--foreground)",
    primary: true,
  },
  {
    id: "socket",
    label: "Socket",
    sub: "one feed, every tab",
    x: 68,
    tint: "var(--asset-eth)",
    primary: false,
  },
];

export default function Schematic() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
        <h2 className="max-w-[22ch] text-[clamp(1.9rem,3.4vw,2.9rem)] font-normal leading-[1.1] tracking-[-0.03em] text-foreground">
          Prices in one side, fills out the other.
        </h2>

        {/* Diagram */}
        <div className="relative mt-16 hidden lg:block">
          <svg
            viewBox="0 0 100 26"
            className="w-full overflow-visible"
            style={{ height: "clamp(180px, 22vw, 260px)" }}
            aria-hidden
          >
            {/* Baseline rule the whole system sits on. */}
            <motion.line
              x1="0"
              y1="13"
              x2="100"
              y2="13"
              stroke="currentColor"
              strokeOpacity="0.32"
              strokeWidth="0.22"
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.2, ease: EASE }}
            />

            {NODES.map((node, i) => (
              <g key={node.id}>
                {/* Riser from the baseline up to the node. */}
                <motion.line
                  x1={node.x + 6}
                  y1="13"
                  x2={node.x + 6}
                  y2="6"
                  stroke="currentColor"
                  strokeOpacity="0.34"
                  strokeWidth="0.22"
                  initial={reduce ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.18, ease: EASE }}
                />
                <motion.circle
                  cx={node.x + 6}
                  cy="6"
                  r={node.primary ? 1.9 : 1.2}
                  fill={node.tint}
                  initial={reduce ? false : { scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.45, delay: 0.62 + i * 0.18, ease: EASE }}
                  style={{ transformOrigin: `${node.x + 6}px 6px` }}
                />
              </g>
            ))}

            {/* Return path: fills travel back down to the user's book. */}
            <motion.path
              d="M 90 13 L 90 21 L 10 21 L 10 13"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.30"
              strokeWidth="0.22"
              strokeDasharray="1 1"
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.4, delay: 0.9, ease: EASE }}
            />
          </svg>

          {/* Callouts, positioned against the same 0-100 scale as the svg. */}
          <div className="pointer-events-none absolute inset-0">
            {NODES.map((node, i) => (
              <motion.div
                key={node.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: 0.75 + i * 0.18, ease: EASE }}
                className="absolute top-0 -translate-y-2"
                style={{ left: `${node.x}%` }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {node.label}
                </p>
                <p className="mt-1 text-sm text-foreground">{node.sub}</p>
              </motion.div>
            ))}

            <p className="absolute bottom-0 left-[10%] font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              fills return to your book
            </p>
          </div>
        </div>

        {/* Below lg the diagram is unreadable, so the same flow is a list. */}
        <ol className="mt-12 space-y-6 lg:hidden">
          {NODES.map((node) => (
            <li key={node.id} className="flex gap-4 border-t border-border pt-5">
              <span
                aria-hidden
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: node.tint }}
              />
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {node.label}
                </span>
                <span className="mt-1 block text-sm text-foreground">
                  {node.sub}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-14 max-w-[62ch] text-base leading-relaxed text-muted-foreground">
          Express and Mongoose over a MongoDB replica set, so a signup that
          creates a user and a profile either does both or neither. Auth is JWT
          with argon2 hashing. Funds are simulated; the prices are not.
        </p>
      </div>
    </section>
  );
}
