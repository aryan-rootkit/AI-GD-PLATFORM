'use client';

type Props = {
  label: string;
  progress: number;
};

export function ProgressWidget({ label, progress }: Props) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-800 shadow-inner overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400/90 transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
