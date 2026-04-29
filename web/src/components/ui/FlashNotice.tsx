'use client';

type Props = {
  message: string;
  onDismiss: () => void;
};

/** Compact dismissible success / confirmation strip. */
export function FlashNotice({ message, onDismiss }: Props) {
  return (
    <div
      className="flex items-start justify-between gap-3 rounded-lg border border-emerald-500/35 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-50"
      role="status"
    >
      <p className="min-w-0 leading-snug">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-xs font-medium text-emerald-200/90 hover:text-white"
      >
        Dismiss
      </button>
    </div>
  );
}
