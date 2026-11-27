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
        vn: {
          paper: '#F5F1E8',
          card: '#FBF8F0',
          ink: '#263344',
          sage: '#7C9B95',
          amber: '#D5A478',
          alert: '#AD6267',
          night: '#121A24',
          stage: '#1B2733',
          line: '#D9D1C1',
          quiet: '#7C7A70',
        },
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
        vn: '0 30px 90px rgba(4, 8, 14, 0.55)',
        vnPaper: '0 18px 50px rgba(10, 16, 24, 0.35)',
        vnAmber: '0 12px 34px rgba(213, 164, 120, 0.35)',
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
        vnHalo: {
          '0%': { transform: 'scale(0.85)', opacity: '0.55' },
          '70%': { transform: 'scale(1.75)', opacity: '0' },
          '100%': { transform: 'scale(1.75)', opacity: '0' },
        },
        vnBob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(4px)' },
        },
        vnRise: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        vnSceneIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        vnStamp: {
          '0%': { opacity: '0', transform: 'scale(1.7) rotate(-7deg)' },
          '62%': { opacity: '1', transform: 'scale(0.97) rotate(-3deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-3deg)' },
        },
        vnFlash: {
          '0%': { opacity: '0' },
          '12%': { opacity: '0.85' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        scan: 'scan 7s linear infinite',
        drift: 'drift 7s ease-in-out infinite',
        flicker: 'flicker 6s linear infinite',
        'pulse-ring': 'pulseRing 2.8s ease-out infinite',
        marquee: 'marquee 32s linear infinite',
        breathe: 'breathe 3.4s ease-in-out infinite',
        'vn-halo': 'vnHalo 3.2s ease-out infinite',
        'vn-halo-delayed': 'vnHalo 3.2s ease-out 1.1s infinite',
        'vn-bob': 'vnBob 1.4s ease-in-out infinite',
        'vn-rise': 'vnRise 0.5s ease-out',
        'vn-scene': 'vnSceneIn 0.34s ease-out',
        'vn-stamp': 'vnStamp 0.5s cubic-bezier(0.18, 1.3, 0.4, 1) both',
        'vn-flash': 'vnFlash 0.6s ease-out both',
        'vn-drift-slow': 'drift 12s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
