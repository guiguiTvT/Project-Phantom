import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0B1018',
        surface: '#131C29',
        'surface-2': '#0F1722',
        'surface-3': '#182333',
        line: '#29394D',
        primary: '#52D6D0',
        secondary: '#8A9CB5',
        warning: '#E8B46A',
        danger: '#E76B78',
        ink: '#E8EDF5',
        muted: '#5F7188',
      },
      fontFamily: {
        sans: [
          '"Inter"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          '"Noto Sans SC"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"Cascadia Code"',
          '"SFMono-Regular"',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(82,214,208,0.28), 0 0 24px rgba(82,214,208,0.10)',
        panel: '0 24px 80px rgba(0,0,0,0.45)',
      },
      letterSpacing: {
        widest2: '0.28em',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-8px,0)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '42%': { opacity: '1' },
          '43%': { opacity: '0.35' },
          '45%': { opacity: '1' },
          '78%': { opacity: '0.7' },
          '80%': { opacity: '1' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.6)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        breathe: {
          '0%, 100%': {
            boxShadow: '0 0 0 1px rgba(82,214,208,0.26), 0 0 24px rgba(82,214,208,0.10)',
          },
          '50%': {
            boxShadow: '0 0 0 1px rgba(82,214,208,0.5), 0 0 42px rgba(82,214,208,0.20)',
          },
        },
      },
      animation: {
        scan: 'scan 7s linear infinite',
        drift: 'drift 7s ease-in-out infinite',
        flicker: 'flicker 6s linear infinite',
        'pulse-ring': 'pulseRing 2.8s ease-out infinite',
        marquee: 'marquee 32s linear infinite',
        breathe: 'breathe 3.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
