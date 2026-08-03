import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

const EXCHANGE = [
  {
    from: "you",
    text: "What am I most exposed to right now?",
  },
  {
    from: "pilot",
    text: "Bitcoin, at roughly two thirds of your book. Your other three positions are small enough that a move in BTC decides your day.",
  },
  {
    from: "you",
    text: "Is my open ETH order anywhere near filling?",
  },
  {
    from: "pilot",
    text: "Not yet. It is a limit buy sitting under the current price, so it only fills if ETH comes down to meet it.",
  },
];

export default function Copilot() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="max-w-[16ch] text-[clamp(1.9rem,3.4vw,2.9rem)] font-normal leading-[1.1] tracking-[-0.03em] text-foreground">
              A copilot that has read your book.
            </h2>
            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-muted-foreground">
              It answers against your live positions and open orders, so it can
              tell you what you are exposed to rather than what crypto is.
            </p>
          </div>

          <div className="space-y-3">
            {EXCHANGE.map((message, i) => (
              <motion.div
                key={i}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: EASE }}
                className={
                  message.from === "you"
                    ? "ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground"
                    : "mr-auto max-w-[92%] rounded-xl rounded-bl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground"
                }
              >
                {message.text}
              </motion.div>
            ))}
            <p className="pt-2 font-mono text-[11px] text-muted-foreground">
              Example exchange.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
