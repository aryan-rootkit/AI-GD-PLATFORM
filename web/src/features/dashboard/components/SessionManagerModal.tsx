'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Plus, LogIn, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { RecentSessionsList } from './RecentSessionsList';
import { useCreateSessionMutation, useJoinSessionMutation } from '../hooks/useDashboardQueries';
import { useRecentSessions } from '@/hooks/useRecentSessions';
import type { SessionTopicKind } from '@/types/session';

type TopicPreset = Exclude<SessionTopicKind, 'auto'>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSessionReady: (session: any, action: 'created' | 'joined' | 'practice') => void;
  blockNewSession: boolean;
};

export function SessionManagerModal({ isOpen, onClose, onSessionReady, blockNewSession }: Props) {
  const [mode, setMode] = useState<'pick' | 'create' | 'join'>('pick');
  const [title, setTitle] = useState('');
  const [topicAuto, setTopicAuto] = useState(false);
  const [topicPreset, setTopicPreset] = useState<TopicPreset>('business');
  const [topicCustomText, setTopicCustomText] = useState('');
  const [sessionIdInput, setSessionIdInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { recentSessions } = useRecentSessions();
  const createMutation = useCreateSessionMutation();
  const joinMutation = useJoinSessionMutation();

  if (!isOpen) return null;

  const handleCreate = async () => {
    setError(null);
    if (!title.trim()) return setError('Enter a session title');
    if (!topicAuto && topicPreset === 'custom' && !topicCustomText.trim()) return setError('Describe your custom topic');

    const payload = {
      title: title.trim(),
      topic: topicAuto ? 'auto' : topicPreset === 'custom' ? { custom: topicCustomText.trim() } : { preset: topicPreset }
    };

    try {
      const data = await createMutation.mutateAsync(payload);
      onSessionReady(data, 'created');
    } catch (e: any) {
      setError(e.message || 'Failed to create session');
    }
  };

  const handleJoin = async (idToJoin?: string) => {
    setError(null);
    const id = (idToJoin ?? sessionIdInput).trim();
    if (!id) return setError('Enter a session ID');

    try {
      const data = await joinMutation.mutateAsync(id);
      onSessionReady(data, 'joined');
    } catch (e: any) {
      setError(e.message || 'Failed to join session');
    }
  };

  const handlePractice = async () => {
    setError(null);
    try {
      const data = await createMutation.mutateAsync({
        title: 'Practice with AI',
        isPractice: true,
      });
      onSessionReady(data, 'practice');
    } catch (e: any) {
      setError(e.message || 'Failed to start practice session');
    }
  };

  const busy = createMutation.isPending || joinMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">
            {mode === 'pick' ? 'Start Session' : mode === 'create' ? 'Create New Room' : 'Join Room'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            disabled={busy}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          {mode === 'pick' && (
            <div className="space-y-4">
              <Button
                onClick={() => { setError(null); setMode('create'); }}
                className="w-full justify-start gap-3 py-4 text-left"
                disabled={blockNewSession}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-base">Create New Session</div>
                  <div className="text-xs text-violet-200 font-normal">Host a new room and invite others</div>
                </div>
              </Button>

              <Button
                variant="secondary"
                onClick={() => { setError(null); setMode('join'); }}
                className="w-full justify-start gap-3 py-4 text-left border border-white/5 bg-slate-800 hover:bg-slate-700 hover:border-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/50">
                  <LogIn className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <div className="font-semibold text-base text-slate-200">Join Existing Session</div>
                  <div className="text-xs text-slate-400 font-normal">Enter an ID or pick from history</div>
                </div>
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-xs"><span className="bg-slate-900 px-2 text-slate-500 uppercase font-medium tracking-wide">Or</span></div>
              </div>

              <Button
                variant="secondary"
                onClick={handlePractice}
                disabled={blockNewSession || busy}
                className="w-full gap-2 border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200"
              >
                {createMutation.isPending && mode === 'pick' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Practice with AI
              </Button>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <Input
                label="Session title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={busy}
                placeholder="e.g. Q3 Marketing Strategy"
              />
              <div className="space-y-3 rounded-xl border border-white/5 bg-slate-800/30 p-4">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={topicAuto}
                    onChange={(e) => setTopicAuto(e.target.checked)}
                    disabled={busy}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-violet-600 focus:ring-violet-500 focus:ring-offset-slate-900"
                  />
                  <span className="font-medium">Assign topic automatically</span>
                </label>
                {!topicAuto && (
                  <div className="space-y-3 pt-2">
                    <label className="block space-y-1.5 text-sm">
                      <span className="text-slate-400 font-medium">Discussion topic</span>
                      <select
                        value={topicPreset}
                        onChange={(e) => setTopicPreset(e.target.value as TopicPreset)}
                        disabled={busy}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-100 outline-none transition hover:border-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                      >
                        <option value="business">Business</option>
                        <option value="technology">Technology</option>
                        <option value="abstract">Abstract</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                    {topicPreset === 'custom' && (
                      <Input
                        label="Custom topic"
                        value={topicCustomText}
                        onChange={(e) => setTopicCustomText(e.target.value)}
                        placeholder="What should participants explore?"
                        disabled={busy}
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => setMode('pick')} disabled={busy} className="w-1/3">
                  Back
                </Button>
                <Button onClick={handleCreate} disabled={busy} className="w-2/3 gap-2">
                  {createMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin"/> Creating...</> : 'Create Room'}
                </Button>
              </div>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">Recent Sessions</p>
                <RecentSessionsList
                  items={recentSessions}
                  onRowClickFill={(id) => { setSessionIdInput(id); setError(null); }}
                  onJoin={(id) => handleJoin(id)}
                  joinBusyForId={joinMutation.isPending ? sessionIdInput : null}
                  disabled={busy}
                />
              </div>
              <div className="space-y-3 border-t border-white/10 pt-4">
                <p className="text-xs font-medium text-slate-400 px-1">Or enter a session ID manually</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      label=""
                      value={sessionIdInput}
                      onChange={(e) => setSessionIdInput(e.target.value)}
                      disabled={busy}
                      placeholder="Paste ID here"
                    />
                  </div>
                  <Button onClick={() => handleJoin()} disabled={busy} className="w-[100px]">
                    {joinMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Join'}
                  </Button>
                </div>
              </div>
              <div className="pt-2">
                <Button variant="secondary" onClick={() => setMode('pick')} disabled={busy} className="w-full">
                  Back to Options
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
