import AboutHero from "@/components/about/AboutHero";
import Journey from "@/components/about/Journey";
import Schematic from "@/components/about/Schematic";
import Team from "@/components/about/Team";
import AboutClose from "@/components/about/AboutClose";

/**
 * About deliberately shares no section component with the landing page.
 *
 * Same design language, different composition: the landing sells the product,
 * About explains the machine. Its layout families are its own - a scroll-pinned
 * horizontal sequence, an annotated schematic, an open-seat team grid, and a
 * left-aligned close - none of which appear on the landing page.
 */
export default function About() {
  return (
    <main className="w-full">
      <AboutHero />
      <Journey />
      <Schematic />
      <Team />
      <AboutClose />
    </main>
  );
}
