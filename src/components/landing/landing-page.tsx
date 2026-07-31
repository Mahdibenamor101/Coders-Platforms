import { LandingNav } from "./nav";
import { LandingHero } from "./hero";
import { LandingFeatures } from "./features";
import { LandingHowItWorks } from "./how-it-works";
import { LandingPricing } from "./pricing";
import { LandingFaq } from "./faq";
import { LandingCta } from "./cta";
import { LandingFooter } from "./footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingPricing />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
