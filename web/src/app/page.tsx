import type { Metadata } from 'next';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingHeroSection } from '@/components/marketing/HeroSection';
import { SocialProofBar } from '@/components/marketing/SocialProofBar';
import { ProblemSection } from '@/components/marketing/ProblemSection';
import { FeatureGridSection } from '@/components/marketing/FeatureGridSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { ScreenshotsSection } from '@/components/marketing/ScreenshotsSection';
import { UseCasesSection } from '@/components/marketing/UseCasesSection';
import { TestimonialsSection } from '@/components/marketing/TestimonialsSection';
import { PricingSection } from '@/components/marketing/PricingSection';
import { FinalCtaSection } from '@/components/marketing/FinalCtaSection';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: 'AI GD Platform | AI-powered group discussions',
  description:
    'Run live discussions, debates, and team sessions with AI summaries, insights, and decisions. Sign in to use the app.',
  openGraph: {
    title: 'AI GD Platform',
    description:
      'Structured real-time collaboration for teams, cohorts, and serious practice.',
  },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <MarketingHeroSection />
        <SocialProofBar />
        <ProblemSection />
        <FeatureGridSection />
        <HowItWorksSection />
        <ScreenshotsSection />
        <UseCasesSection />
        <TestimonialsSection />
        <PricingSection />
        <FinalCtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
