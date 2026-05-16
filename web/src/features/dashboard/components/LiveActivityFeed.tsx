'use client';

import { Activity, UserPlus, CheckCircle, BrainCircuit } from 'lucide-react';
import { useEffect, useState } from 'react';

const MOCK_EVENTS = [
  { id: 1, type: 'join', text: 'Alex joined Technology Debate', time: 'Just now', icon: UserPlus, color: 'text-emerald-400' },
  { id: 2, type: 'ai', text: 'AI Feedback generated for Startup Pitch', time: '2m ago', icon: BrainCircuit, color: 'text-violet-400' },
  { id: 3, type: 'eval', text: 'Session evaluation completed', time: '15m ago', icon: CheckCircle, color: 'text-amber-400' },
];

export function LiveActivityFeed() {
  const [events, setEvents] = useState(MOCK_EVENTS);

  // Simulate a live event popping in after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setEvents(prev => [
        { id: Date.now(), type: 'join', text: 'Taylor joined HR Discussion', time: 'Just now', icon: UserPlus, color: 'text-emerald-400' },
        ...prev.map(e => ({ ...e, time: e.time === 'Just now' ? '1m ago' : e.time })).slice(0, 3)
      ]);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-md sm:p-6"
      aria-labelledby="live-activity-heading"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-400" strokeWidth={2} />
          <h2 id="live-activity-heading" className="text-base font-semibold text-white">Live Activity</h2>
        </div>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className={`mt-0.5 rounded-full bg-slate-800 p-1.5 ${event.color}`}>
              <event.icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{event.text}</p>
              <p className="text-xs text-slate-500">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
