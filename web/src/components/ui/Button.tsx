import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
};

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: Props) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none';
  const styles = {
    primary: 'bg-violet-600 text-white hover:bg-violet-500 focus:ring-violet-500',
    secondary:
      'border border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800 focus:ring-slate-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-500',
  }[variant];
  return <button type={type} className={`${base} ${styles} ${className}`} {...props} />;
}
