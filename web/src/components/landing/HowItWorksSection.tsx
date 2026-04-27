import { UserPlus, DoorOpen, MessageSquare, LineChart } from 'lucide-react';
import { Container } from './Container';

const steps = [
  {
    step: '01',
    title: 'Create a profile',
    text: 'Sign up and get a workspace tailored for group practice.',
    icon: <UserPlus className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    step: '02',
    title: 'Start or join a room',
    text: 'Launch a new session or enter with an invite in seconds.',
    icon: <DoorOpen className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    step: '03',
    title: 'Discuss in real time',
    text: 'Message live with peers while the AI steers the flow.',
    icon: <MessageSquare className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    step: '04',
    title: 'Review the arc',
    text: 'Revisit the thread, patterns, and feedback in one place.',
    icon: <LineChart className="h-5 w-5" strokeWidth={1.75} />,
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-24"
      aria-labelledby="how-heading"
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="how-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            How it works
          </h2>
          <p className="mt-3 text-slate-400 sm:text-lg">
            From first login to a finished session, the path stays simple and fast.
          </p>
        </div>

        <ol className="mt-14 grid list-none grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.step} className="relative">
              <div className="flex flex-col sm:items-center sm:text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-600/20 to-indigo-600/10 text-violet-200 shadow-inner">
                  {s.icon}
                </div>
                <span className="text-xs font-mono text-violet-500/80">{s.step}</span>
                <h3 className="mt-1 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
