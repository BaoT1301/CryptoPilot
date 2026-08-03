import AboutHero from "@/components/about/AboutHero";
import Ticker from "@/components/landing/Ticker";
import Stack from "@/components/about/Stack";
import Team from "@/components/about/Team";
import Close from "@/components/landing/Close";

/**
 * Layout families here deliberately differ from the landing page: centred
 * manifesto hero, definition-list spec grid, card grid, shared close.
 */
export default function About() {
  return (
    <main className="w-full">
      <AboutHero />
      <Ticker />
      <Stack />
      <Team />
      <Close />
    </main>
  );
}
