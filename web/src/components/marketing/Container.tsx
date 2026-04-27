import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'footer' | 'header' | 'nav';
  id?: string;
};

export function MContainer({ children, className = '', as: C = 'div', id }: Props) {
  return <C id={id} className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</C>;
}
