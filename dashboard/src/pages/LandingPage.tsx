import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import ProblemSection from "../components/landing/ProblemSection";
import ClaimJourney from "../components/landing/ClaimJourney";
import PolicyVerificationSection from "../components/landing/PolicyVerificationSection";
import ClaimsOfficerSection from "../components/landing/ClaimsOfficerSection";
import DispatchSection from "../components/landing/DispatchSection";
import FieldAdjusterSection from "../components/landing/FieldAdjusterSection";
import TraceabilitySection from "../components/landing/TraceabilitySection";
import ReviewDecisionSection from "../components/landing/ReviewDecisionSection";
import BusinessValueSection from "../components/landing/BusinessValueSection";
import AudienceSection from "../components/landing/AudienceSection";
import ProductGallery from "../components/landing/ProductGallery";
import CompleteJourneySection from "../components/landing/CompleteJourneySection";
import AboutSection from "../components/landing/AboutSection";
import FinalCTA from "../components/landing/FinalCTA";
import LandingFooter from "../components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl" lang="ar">
      <LandingNavbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <ClaimJourney />
        <PolicyVerificationSection />
        <ClaimsOfficerSection />
        <DispatchSection />
        <FieldAdjusterSection />
        <TraceabilitySection />
        <ReviewDecisionSection />
        <BusinessValueSection />
        <AudienceSection />
        <ProductGallery />
        <CompleteJourneySection />
        <AboutSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
