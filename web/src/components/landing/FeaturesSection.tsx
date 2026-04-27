import { Bot, MessageCircle, BarChart2, Users } from 'lucide-react';
import { Container } from './Container';
import { FeatureCard } from './FeatureCard';

const features = [
  {
    title: 'AI Moderator',
    description:
      'Proactive follow-ups, balanced airtime, and prompts that keep the conversation productive.',
    icon: <Bot className="h-5 w-5" strokeWidth={1.75} aria-hidden />,
  },
  {
    title: 'Live Discussions',
    description:
      'Low-latency voice of the team with instant message sync across every connected participant.',
    icon: <MessageCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />,
  },
  {
    title: 'Performance Feedback',
    description:
      'Structured signals on clarity, engagement, and collaboration—ready when you are.',
    icon: <BarChart2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />,
  },
  {
    title: 'Multi-user Rooms',
    description:
      'Create rooms, invite the cohort, and run realistic multi-person practice sessions.',
    icon: <Users className="h-5 w-5" strokeWidth={1.75} aria-hidden />,
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-24" aria-labelledby="features-heading">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Built for serious practice
          </h2>
          <p className="mt-3 text-slate-400 sm:text-lg">
            Everything you need to simulate real group dynamics—with AI in the room.
          </p>
        </div>
        <ul className="mt-12 grid list-none grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-8">
          {features.map((f) => (
            <li key={f.title}>
              <FeatureCard
                title={f.title}
                description={f.description}
                icon={f.icon}
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
