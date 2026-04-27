'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

type Props = {
  disabled?: boolean;
  onSend: (text: string) => void;
};

export function MessageComposer({ disabled, onSend }: Props) {
  const [text, setText] = useState('');

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };

  return (
    <div className="flex gap-2 p-3 sm:p-3.5">
      <textarea
        rows={2}
        disabled={disabled}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Write a message… (Enter to send, Shift+Enter for newline)"
        className="min-h-[44px] flex-1 resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 placeholder:text-slate-500 focus:border-violet-500 focus:ring-1"
      />
      <Button
        type="button"
        onClick={submit}
        disabled={disabled || !text.trim()}
        className="self-end"
      >
        Send
      </Button>
    </div>
  );
}
