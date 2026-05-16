'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Copy, Check, Link as LinkIcon } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
};

export function InviteParticipantsModal({ isOpen, onClose, sessionId }: Props) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/dashboard?join=${sessionId}` : '';

  const copyToClipboard = async (text: string, type: 'link' | 'id') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Invite Participants</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Invite Link</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-slate-300 outline-none"
                />
              </div>
              <Button variant="secondary" onClick={() => copyToClipboard(inviteLink, 'link')} className="w-[100px]">
                {copiedLink ? <><Check className="h-4 w-4 mr-1 text-emerald-400" /> Copied</> : <><Copy className="h-4 w-4 mr-1" /> Copy</>}
              </Button>
            </div>
            <p className="text-[11px] text-slate-500">Anyone with this link can join the session directly.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Session ID</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  readOnly
                  value={sessionId}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-300 outline-none font-mono tracking-wider"
                />
              </div>
              <Button variant="secondary" onClick={() => copyToClipboard(sessionId, 'id')} className="w-[100px]">
                {copiedId ? <><Check className="h-4 w-4 mr-1 text-emerald-400" /> Copied</> : <><Copy className="h-4 w-4 mr-1" /> Copy</>}
              </Button>
            </div>
            <p className="text-[11px] text-slate-500">Participants can manually enter this ID on the dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
