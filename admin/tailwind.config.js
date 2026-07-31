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
          dark: '#241C49',
          light: '#4A3B8C',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'sans-serif'],
        body: ['"Nunito Sans"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(42, 27, 61, 0.08)',
        card: '0 6px 24px rgba(214, 51, 108, 0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
