'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2 } from 'lucide-react';
import { RecentSessionsList } from './RecentSessionsList';
import { useJoinSessionMutation } from '../hooks/useDashboardQueries';
import { useRecentSessions } from '@/hooks/useRecentSessions';

type Props = {
  onSessionReady: (session: { id: string; title: string; hostId?: string }, action: 'joined') => void;
  onCancel: () => void;
};

export function JoinSessionForm({ onSessionReady, onCancel }: Props) {
  const [sessionIdInput, setSessionIdInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { recentSessions } = useRecentSessions();
  const joinMutation = useJoinSessionMutation();
  const busy = joinMutation.isPending;

  const handleJoin = async (idToJoin?: string) => {
    setError(null);
    const id = (idToJoin ?? sessionIdInput).trim();
    if (!id) return setError('Enter a session ID');

    try {
      const data = await joinMutation.mutateAsync(id);
      onSessionReady(data, 'joined');
    } catch (e) {
      const err = e as Error;
      setError(err.message || 'Failed to join session');
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">Recent Sessions</p>
        <RecentSessionsList
          items={recentSessions}
          onRowClickFill={(id) => { setSessionIdInput(id); setError(null); }}
          onJoin={(id) => handleJoin(id)}
          joinBusyForId={busy ? sessionIdInput : null}
          disabled={busy}
        />
      </div>

      <div className="space-y-3 border-t border-white/10 pt-4 mt-4">
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
            {busy ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Join'}
          </Button>
        </div>
      </div>

      <div className="pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={busy} className="w-full">
          Back to Options
        </Button>
      </div>
    </div>
  );
}
