'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DISCUSSION_TEMPLATES } from '@/lib/discussionTemplates';

export type ComposerPrefill = { id: number; text: string };

type Props = {
  disabled?: boolean;
  onSend: (text: string) => void;
  /** Bump `id` whenever the parent wants to replace the draft (quick actions). */
  prefill?: ComposerPrefill | null;
  /** Called when the user types non-whitespace (parent may throttle socket `typing`). */
  onTypingActivity?: () => void;
};

const ACTION_ROW: { label: string; template: string }[] = [
  { label: 'Agree', template: DISCUSSION_TEMPLATES.agree },
  { label: 'Disagree', template: DISCUSSION_TEMPLATES.disagree },
  { label: 'Raise Point', template: DISCUSSION_TEMPLATES.raisePoint },
  { label: 'Ask Question', template: DISCUSSION_TEMPLATES.askQuestion },
];

export function MessageComposer({ disabled, onSend, prefill, onTypingActivity }: Props) {
  const [text, setText] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);
  const actionsId = useId();

  useEffect(() => {
    if (!prefill) return;
    setText(prefill.text);
    const t = window.setTimeout(() => {
      taRef.current?.focus();
      const len = prefill.text.length;
      try {
        taRef.current?.setSelectionRange(len, len);
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [prefill?.id, prefill?.text]);

  const applyTemplate = (template: string) => {
    setText(template);
    window.setTimeout(() => {
      taRef.current?.focus();
      const len = template.length;
      try {
        taRef.current?.setSelectionRange(len, len);
      } catch {
        /* ignore */
      }
    }, 0);
  };

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };

  return (
    <div className="space-y-2 p-3 sm:p-3.5">
      <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby={actionsId}>
        <span id={actionsId} className="sr-only">
          Quick phrases for structured discussion
        </span>
        {ACTION_ROW.map(({ label, template }) => (
          <Button
            key={label}
            type="button"
            variant="secondary"
            disabled={disabled}
            className="px-2.5 py-1.5 text-xs font-medium"
            onClick={() => applyTemplate(template)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <textarea
          ref={taRef}
          rows={2}
          disabled={disabled}
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            if (v.trim()) onTypingActivity?.();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Write a message… (Enter to send, Shift+Enter for newline)"
          className="min-h-[44px] flex-1 resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 placeholder:text-slate-500 focus:border-violet-500 focus:ring-1"
        />
        <Button type="button" onClick={submit} disabled={disabled || !text.trim()} className="self-end">
          Send
        </Button>
      </div>
    </div>
  );
}
