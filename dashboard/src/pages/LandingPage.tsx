import "../styles/landing.css";

import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import AudienceSection from "../components/landing/AudienceSection";
import ProblemSection from "../components/landing/ProblemSection";
import ClaimJourney from "../components/landing/ClaimJourney";
import ProductShowcase from "../components/landing/ProductShowcase";
import OutcomesSection from "../components/landing/OutcomesSection";
import ProductValidationSection from "../components/landing/ProductValidationSection";
import FinalCTA from "../components/landing/FinalCTA";
import LandingFooter from "../components/landing/LandingFooter";
import ScrollToTop from "../components/landing/ScrollToTop";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl" lang="ar">
      <LandingNavbar />
      <main>
        <HeroSection />
        <AudienceSection />
        <ProblemSection />
        <ClaimJourney />
        <ProductShowcase />
        <OutcomesSection />
        <ProductValidationSection />
        <FinalCTA />
      </main>
      <LandingFooter />
      <ScrollToTop />
    </div>
  );
}
