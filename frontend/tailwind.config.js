/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2A1B3D',
        canvas: '#FFF8EF',
        blush: '#FDEDE7',
        butter: '#FFF7E0',
        mint: '#EFF6EC',
        lavender: '#F3F0FA',
        rani: {
          DEFAULT: '#D6336C',
          dark: '#B22558',
          light: '#F26FA0',
        },
        marigold: {
          DEFAULT: '#F5A524',
          dark: '#D68A0F',
          light: '#FFCB66',
        },
        mehendi: {
          DEFAULT: '#5B7B3F',
          dark: '#44602D',
          light: '#89A968',
        },
        indigo_ink: {
          DEFAULT: '#362A6B',
          dark: '#2A2054',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'sans-serif'],
        body: ['"Nunito Sans"', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(42, 27, 61, 0.08)',
        card: '0 6px 24px rgba(214, 51, 108, 0.10)',
        sticker: '0 2px 0 rgba(42, 27, 61, 0.15)',
      },
      borderRadius: {
        xl2: '1.25rem',
        blob: '42% 58% 60% 40% / 45% 45% 55% 55%',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        popIn: 'popIn 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
