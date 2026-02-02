import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import LatestPressSection from "@/components/LatestPressSection";
import LeadershipSection from "@/components/LeadershipSection";
import CriticalIssuesSection from "@/components/CriticalIssuesSection";
import YouTubeSection from "@/components/YouTubeSection";
import VoterDriveSection from "@/components/VoterDriveSection";
import JoinMovementCTA from "@/components/JoinMovementCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <LatestPressSection />
        <LeadershipSection />
        <CriticalIssuesSection />
        <YouTubeSection />
        <VoterDriveSection />
        <JoinMovementCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
