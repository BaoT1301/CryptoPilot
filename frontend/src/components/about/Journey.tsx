import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

/**
 * One order, walked through its whole life, as a scroll-pinned horizontal pan.
 *
 * This is the page's argument made structural: the claim is that we model the
 * states between "placed" and "filled", so the section physically travels
 * through those states instead of listing them. Vertical scroll drives
 * horizontal travel, which forces the reader through the sequence in order and
 * at the pace the story wants.
 *
 * Under reduced motion the pin is skipped entirely and the four stages stack
 * vertically, which reads fine and costs nothing.
 */
const STAGES = [
  {
    state: "open",
    title: "You place it.",
    body: "A limit buy at a price under the market. It does not fill, because nothing is selling that low yet.",
    tint: "var(--muted-foreground)",
  },
  {
    state: "open",
    title: "It waits on the book.",
    body: "Sitting in the queue with every other order at that price, behind whoever got there first.",
    tint: "var(--asset-eth)",
  },
  {
    state: "partially_filled",
    title: "Half of it fills.",
    body: "A seller crosses your price but only wants part of your size. Most demos would call this done. It is not done.",
    tint: "var(--brand)",
  },
  {
    state: "filled",
    title: "The rest completes.",
    body: "The remainder matches, the balance follows the fill, and the whole thing lands in your history.",
    tint: "var(--market-up)",
  },
];

export default function Journey() {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;
    // Desktop only: on a phone the pin fights native scrolling.
    const mq = window.matchMedia("(min-width: 1024px)");
    if (!mq.matches) return;

    const ctx = gsap.context(() => {
      const distance = track.current!.scrollWidth - window.innerWidth;
      if (distance <= 0) return;

      gsap.to(track.current, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrap);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <section
      ref={wrap}
      className="relative overflow-hidden border-b border-border bg-[var(--paper-sunk)]"
    >
      <div
        ref={track}
        className="flex flex-col gap-16 px-6 py-24 md:px-10 lg:h-[100dvh] lg:w-max lg:flex-row lg:items-center lg:gap-0 lg:py-0"
      >
        {/* Lead panel travels with the track so the heading is part of the pan. */}
        <div className="lg:flex lg:w-[46vw] lg:shrink-0 lg:flex-col lg:justify-center lg:pr-24">
          <h2 className="max-w-[16ch] text-[clamp(1.9rem,3.4vw,2.9rem)] font-normal leading-[1.1] tracking-[-0.03em] text-foreground">
            The life of one order.
          </h2>
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-muted-foreground">
            Every state below is one the engine actually writes. The interesting
            part is the middle, which is exactly the part a mock skips.
          </p>
        </div>

        {STAGES.map((stage, i) => (
          <article
            key={stage.title}
            className="relative border-t border-border pt-8 lg:w-[34vw] lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-12 lg:pr-12 lg:pt-0"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: stage.tint }}
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {stage.state}
              </span>
            </div>

            {/* Ordinal set in the display face, oversized and low-contrast, so
                the sequence is legible without a numbered eyebrow. */}
            <span
              aria-hidden
              className="mt-6 block font-mono text-[clamp(3rem,7vw,5.5rem)] leading-none tracking-[-0.05em] text-foreground/10"
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            <h3 className="mt-6 max-w-[14ch] text-[clamp(1.5rem,2.4vw,2rem)] font-normal leading-[1.15] tracking-[-0.03em] text-foreground">
              {stage.title}
            </h3>
            <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
              {stage.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
