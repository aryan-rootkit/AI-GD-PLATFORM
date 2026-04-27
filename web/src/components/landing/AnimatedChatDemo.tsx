'use client';

import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { Container } from './Container';

type Line = { id: string; who: 'user' | 'user2' | 'ai'; name: string; text: string };

const SCRIPT: Line[] = [
  { id: '1', who: 'user', name: 'Aryan', text: 'I think AI will displace a lot of routine work—but not all jobs.' },
  { id: '2', who: 'ai', name: 'AI Moderator', text: 'Can you support that with a concrete example from your field?' },
  { id: '3', who: 'user2', name: 'Maya', text: 'Remote work increased productivity in our org, but it depends on the team culture.' },
  { id: '4', who: 'ai', name: 'AI Moderator', text: 'Interesting—can you compare a high-trust team vs. a siloed one in one sentence each?' },
];

function bubbleClass(who: Line['who']) {
  if (who === 'ai') {
    return 'border border-violet-500/30 bg-violet-500/[0.08] text-slate-100';
  }
  return 'border border-slate-600/50 bg-slate-800/60 text-slate-100';
}

export function AnimatedChatDemo() {
  const [visible, setVisible] = useState(0);
  const [typing, setTyping] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    setVisible(0);
    setTyping(false);
  }, [resetKey]);

  useEffect(() => {
    if (visible >= SCRIPT.length) {
      const t = window.setTimeout(() => {
        setResetKey((k) => k + 1);
      }, 3500);
      return () => window.clearTimeout(t);
    }
    setTyping(true);
    const t1 = window.setTimeout(() => {
      setTyping(false);
      setVisible((v) => v + 1);
    }, 1200);
    return () => window.clearTimeout(t1);
  }, [visible, resetKey]);

  return (
    <section
      className="border-t border-b border-white/5 bg-slate-900/20 py-20 sm:py-24"
      aria-labelledby="animated-demo-heading"
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="animated-demo-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            See the AI in the room
          </h2>
          <p className="mt-2 text-slate-400 sm:text-lg">
            Simulated live thread—no API calls, just motion and copy to show the experience.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-lg">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-2xl">
            <div className="border-b border-white/5 bg-slate-900/50 px-4 py-2.5 text-center text-xs text-slate-500">
              Demo · not connected
            </div>
            <div className="min-h-[280px] space-y-3 p-4 sm:min-h-[300px]">
              {SCRIPT.slice(0, visible).map((line) => (
                <div
                  key={`${line.id}-${resetKey}`}
                  className={`rounded-2xl px-3.5 py-2.5 text-sm transition-opacity duration-500 ${bubbleClass(
                    line.who,
                  )}`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    {line.who === 'ai' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/40 bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-200">
                        <Bot className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                        AI
                      </span>
                    )}
                    <span
                      className={
                        line.who === 'ai' ? 'text-violet-200/80' : 'text-slate-400'
                      }
                    >
                      {line.name}
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-100/95">{line.text}</p>
                </div>
              ))}
              {typing && (
                <p className="flex items-center gap-1.5 text-xs text-slate-500" role="status">
                  <span className="inline-flex gap-0.5" aria-hidden>
                    <span className="h-1 w-1 animate-bounce rounded-full bg-slate-500" />
                    <span
                      className="h-1 w-1 animate-bounce rounded-full bg-slate-500"
                      style={{ animationDelay: '0.12s' }}
                    />
                    <span
                      className="h-1 w-1 animate-bounce rounded-full bg-slate-500"
                      style={{ animationDelay: '0.24s' }}
                    />
                  </span>
                  Typing…
                </p>
              )}
            </div>
            <div className="border-t border-white/5 bg-slate-900/30 px-3 py-2 text-center text-xs text-slate-600">
              Log in to join a real room
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
