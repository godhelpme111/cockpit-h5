/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 国风古韵色板
        ink: {
          DEFAULT: '#1F3A3D',     // 墨青主色
          dark: '#14282B',
          light: '#3A5A5D',
        },
        wash: '#4A5568',           // 水墨灰
        cinnabar: '#C53030',       // 朱砂红
        palace: '#D4A574',         // 宫墙黄
        rice: '#F5F1E8',           // 宣纸白
        mountain: '#E8F0F2',       // 远山青
        jade: '#2C7A7B',           // 玉青
        gold: '#B7791F',           // 御金
      },
      fontFamily: {
        // 中文字体栈
        cn: [
          '"Source Han Serif SC"',
          '"Noto Serif SC"',
          '"Songti SC"',
          'serif',
        ],
        cnSans: [
          '"Source Han Sans SC"',
          '"Noto Sans SC"',
          '"PingFang SC"',
          'sans-serif',
        ],
        en: ['"DIN Pro"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // 大屏友好
        'display': ['64px', { lineHeight: '1.2', letterSpacing: '0.02em' }],
        'title': ['48px', { lineHeight: '1.3' }],
        'subtitle': ['32px', { lineHeight: '1.4' }],
        'body': ['24px', { lineHeight: '1.6' }],
        'small': ['20px', { lineHeight: '1.5' }],
      },
      borderRadius: {
        'card': '16px',
        'btn': '8px',
      },
      boxShadow: {
        'card': '0 8px 24px rgba(31, 58, 61, 0.12)',
        'card-hover': '0 12px 32px rgba(31, 58, 61, 0.18)',
        'inner': 'inset 0 2px 8px rgba(31, 58, 61, 0.08)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.95' },
          '50%': { transform: 'scale(1.02)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        breathe: 'breathe 3s ease-in-out infinite',
        ripple: 'ripple 1.5s ease-out infinite',
        float: 'float 4s ease-in-out infinite',
        pulse: 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
