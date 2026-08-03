import Hero from "@/components/landing/Hero";
import Capabilities from "@/components/landing/Capabilities";
import Lifecycle from "@/components/landing/Lifecycle";
import Copilot from "@/components/landing/Copilot";
import Close from "@/components/landing/Close";

/**
 * Section order is a narrative: what it is (hero), what it does
 * (capabilities), why the execution is different (lifecycle), the thing nobody
 * else has (copilot), then the ask (close).
 *
 * Each section uses a different layout family so the page does not read as one
 * template repeated: asymmetric split, four-column rule grid, full-width data
 * tape, split with conversation, centred close.
 */
export default function Home() {
  return (
    <main className="w-full">
      <Hero />
      <Capabilities />
      <Lifecycle />
      <Copilot />
      <Close />
    </main>
  );
}
