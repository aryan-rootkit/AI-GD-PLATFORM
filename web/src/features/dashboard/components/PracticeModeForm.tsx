'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { useCreateSessionMutation } from '../hooks/useDashboardQueries';
import type { SessionTopicKind } from '@/types/session';

type TopicPreset = Exclude<SessionTopicKind, 'auto'> | 'debate' | 'pitch' | 'hr' | 'case-study' | 'general';

type Props = {
  onSessionReady: (session: { id: string; title: string; hostId?: string }, action: 'practice') => void;
  onCancel: () => void;
};

export function PracticeModeForm({ onSessionReady, onCancel }: Props) {
  const [topicPreset, setTopicPreset] = useState<TopicPreset>('debate');
  const [topicCustomText, setTopicCustomText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateSessionMutation();
  const busy = createMutation.isPending;

  const handlePractice = async () => {
    setError(null);
    if (topicPreset === 'custom' && !topicCustomText.trim()) {
      return setError('Please describe what you want to practice.');
    }

    try {
      const data = await createMutation.mutateAsync({
        title: 'Practice Session',
        isPractice: true,
        practiceParticipants: [
          { id: 'ai-1', displayName: 'Alex (AI)' },
          { id: 'ai-2', displayName: 'Taylor (AI)' }
        ],
        topic: topicPreset === 'custom' ? { custom: topicCustomText.trim() } : { preset: topicPreset }
      });
      onSessionReady(data, 'practice');
    } catch (e) {
      const err = e as Error;
      setError(err.message || 'Failed to start practice session');
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
        <BrainCircuit className="h-5 w-5 text-amber-400 shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-amber-200">AI Practice Mode</h3>
          <p className="mt-1 text-xs text-amber-200/70">
            A safe space to practice discussions. The system will create mock AI participants who will respond to your arguments.
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="block space-y-1.5 text-sm">
          <span className="text-slate-400 font-medium">What do you want to practice?</span>
          <select
            value={topicPreset}
            onChange={(e) => setTopicPreset(e.target.value as TopicPreset)}
            disabled={busy}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-100 outline-none transition hover:border-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          >
            <option value="debate">Technology Debate</option>
            <option value="pitch">Startup Pitch</option>
            <option value="hr">HR / Interview Discussion</option>
            <option value="case-study">Business Case Study</option>
            <option value="general">General Discussion</option>
            <option value="custom">Custom Scenario</option>
          </select>
        </label>
        {topicPreset === 'custom' && (
          <Input
            label="Custom Scenario"
            value={topicCustomText}
            onChange={(e) => setTopicCustomText(e.target.value)}
            placeholder="E.g. Pitching a new product feature to executives"
            disabled={busy}
          />
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={busy} className="w-1/3">
          Back
        </Button>
        <Button onClick={handlePractice} disabled={busy} className="w-2/3 gap-2 border-amber-500 bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Start Practice
        </Button>
      </div>
    </div>
  );
}
