import type { Metadata } from 'next';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { AnimatedChatDemo } from '@/components/landing/AnimatedChatDemo';
import { SiteFooter } from '@/components/landing/SiteFooter';

export const metadata: Metadata = {
  title: 'AI GD Platform | Practice group discussions with AI',
  description:
    'Run live multi-user rooms with an AI moderator, structured feedback, and a polished session experience—built for teams and serious practice.',
  openGraph: {
    title: 'AI GD Platform',
    description:
      'Practice group discussions with AI-powered feedback, live rooms, and performance insight.',
  },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <DemoSection />
        <HowItWorksSection />
        <AnimatedChatDemo />
      </main>
      <SiteFooter />
    </div>
  );
}
