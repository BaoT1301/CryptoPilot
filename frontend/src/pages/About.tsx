import AboutHeroSection from "@/components/sections/AboutHeroSection";
import MissionVisionSection from "@/components/sections/MissionVisionSection";
import CoreValuesSection from "@/components/sections/CoreValuesSection";
import TeamSection from "@/components/sections/TeamSection";
import AboutStatsSection from "@/components/sections/AboutStatsSection";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <AboutHeroSection />
      <MissionVisionSection />
      <CoreValuesSection />
      <TeamSection />
      <AboutStatsSection />
    </div>
  );
}
