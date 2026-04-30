import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(0.5rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'system-banner': {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'border-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(167, 139, 250, 0)' },
          '50%': { boxShadow: '0 0 12px 0 rgba(52, 211, 153, 0.25)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
        shimmer: 'shimmer 2.5s ease-in-out infinite',
        'system-banner': 'system-banner 0.45s ease-out forwards',
        'system-glow-join': 'border-glow 2s ease-in-out 1',
        'system-glow-leave': 'border-glow 2s ease-in-out 1',
      },
    },
  },
  plugins: [],
};

export default config;
