'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Zap, LayoutTemplate, Briefcase, MessagesSquare, Lightbulb, UserCheck } from 'lucide-react';
import { useCreateSessionMutation } from '../hooks/useDashboardQueries';
import type { SessionTopicKind } from '@/types/session';

type TopicPreset = Exclude<SessionTopicKind, 'auto'> | 'debate' | 'pitch' | 'hr' | 'case-study' | 'general';

type Props = {
  onSessionReady: (session: { id: string; title: string; hostId?: string }, action: 'created') => void;
  onCancel: () => void;
};

const TEMPLATES = [
  { id: 'debate', label: 'Tech Debate', icon: Zap, desc: 'Argue different technical approaches' },
  { id: 'pitch', label: 'Startup Pitch', icon: Lightbulb, desc: 'Pitch ideas to a group' },
  { id: 'hr', label: 'HR Discussion', icon: UserCheck, desc: 'Behavioral and management talks' },
  { id: 'case-study', label: 'Case Study', icon: Briefcase, desc: 'Solve business problems' },
  { id: 'general', label: 'General', icon: MessagesSquare, desc: 'Open format discussion' },
  { id: 'custom', label: 'Custom', icon: LayoutTemplate, desc: 'Define your own topic' },
] as const;

export function CreateSessionForm({ onSessionReady, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [topicPreset, setTopicPreset] = useState<TopicPreset>('general');
  const [topicCustomText, setTopicCustomText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateSessionMutation();
  const busy = createMutation.isPending;

  const handleCreate = async () => {
    setError(null);
    if (!title.trim()) return setError('Enter a session title');
    if (topicPreset === 'custom' && !topicCustomText.trim()) return setError('Describe your custom topic');

    const payload = {
      title: title.trim(),
      topic: topicPreset === 'custom' ? { custom: topicCustomText.trim() } : { preset: topicPreset }
    };

    try {
      const data = await createMutation.mutateAsync(payload);
      onSessionReady(data, 'created');
    } catch (e) {
      const err = e as Error;
      setError(err.message || 'Failed to create session');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <Input
        label="Session title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={busy}
        placeholder="e.g. Q3 Marketing Strategy"
      />

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">Select Template</span>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTopicPreset(t.id as TopicPreset)}
              disabled={busy}
              className={[
                'flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all',
                topicPreset === t.id
                  ? 'border-violet-500 bg-violet-500/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-violet-500/35'
                  : 'border-white/5 bg-slate-800/30 hover:bg-slate-800/60 hover:border-white/10'
              ].join(' ')}
            >
              <div className="flex items-center gap-2">
                <t.icon className={['h-4 w-4', topicPreset === t.id ? 'text-violet-400' : 'text-slate-400'].join(' ')} />
                <span className={['text-sm font-medium', topicPreset === t.id ? 'text-violet-100' : 'text-slate-200'].join(' ')}>{t.label}</span>
              </div>
            </button>
          ))}
        </div>

        {topicPreset === 'custom' && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-2">
            <Input
              label="Custom topic"
              value={topicCustomText}
              onChange={(e) => setTopicCustomText(e.target.value)}
              placeholder="What should participants explore?"
              disabled={busy}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={busy} className="w-1/3">
          Back
        </Button>
        <Button onClick={handleCreate} disabled={busy} className="w-2/3 gap-2">
          {busy ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Create Room'}
        </Button>
      </div>
    </div>
  );
}
