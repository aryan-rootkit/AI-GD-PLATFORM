import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function Input({ label, id, className = '', ...props }: Props) {
  const inputId = id ?? props.name;
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-slate-300">{label}</span>
      <input
        id={inputId}
        className={`w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-violet-500 placeholder:text-slate-500 focus:border-violet-500 focus:ring-1 ${className}`}
        {...props}
      />
    </label>
  );
}
