'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Plus, LogIn, Sparkles } from 'lucide-react';
import { CreateSessionForm } from './CreateSessionForm';
import { JoinSessionForm } from './JoinSessionForm';
import { PracticeModeForm } from './PracticeModeForm';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSessionReady: (session: { title: string; id: string; hostId?: string }, action: 'created' | 'joined' | 'practice') => void;
  blockNewSession: boolean;
};

export function SessionManagerModal({ isOpen, onClose, onSessionReady, blockNewSession }: Props) {
  const [mode, setMode] = useState<'pick' | 'create' | 'join' | 'practice'>('pick');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">
            {mode === 'pick' ? 'Start Session' : mode === 'create' ? 'Create New Room' : mode === 'join' ? 'Join Room' : 'Practice Mode'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {mode === 'pick' && (
            <div className="space-y-4">
              <Button
                onClick={() => setMode('create')}
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
                onClick={() => setMode('join')}
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
                onClick={() => setMode('practice')}
                disabled={blockNewSession}
                className="w-full gap-3 py-4 justify-start text-left border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/30 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <div className="font-semibold text-base text-amber-200">Practice with AI</div>
                  <div className="text-xs text-amber-200/70 font-normal">Mock participants will respond to you</div>
                </div>
              </Button>
            </div>
          )}

          {mode === 'create' && <CreateSessionForm onSessionReady={onSessionReady} onCancel={() => setMode('pick')} />}
          {mode === 'join' && <JoinSessionForm onSessionReady={onSessionReady} onCancel={() => setMode('pick')} />}
          {mode === 'practice' && <PracticeModeForm onSessionReady={onSessionReady} onCancel={() => setMode('pick')} />}
        </div>
      </div>
    </div>
  );
}
