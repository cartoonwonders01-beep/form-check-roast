/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bangers', 'cursive'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        roast: {
          orange: '#FF6B35',
          yellow: '#FFD93D',
          dark: '#1a1a2e',
          card: '#16213e',
          border: '#0f3460',
        },
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '60%': { transform: 'scale(1.1)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        'fire': {
          '0%, 100%': { transform: 'scaleY(1) scaleX(1)' },
          '33%': { transform: 'scaleY(1.05) scaleX(0.95)' },
          '66%': { transform: 'scaleY(0.95) scaleX(1.05)' },
        },
        'pushup-down': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(18px)' },
        },
        'waddle': {
          '0%, 100%': { transform: 'translateY(0px) rotate(-3deg)' },
          '50%': { transform: 'translateY(16px) rotate(3deg)' },
        },
        'moo': {
          '0%, 100%': { transform: 'translateY(0px) scaleX(1)' },
          '50%': { transform: 'translateY(14px) scaleX(1.04)' },
        },
        'boing': {
          '0%, 100%': { transform: 'translateY(0px) scaleY(1)' },
          '50%': { transform: 'translateY(20px) scaleY(0.9)' },
        },
        'lumber': {
          '0%, 100%': { transform: 'translateY(0px) rotate(1deg)' },
          '50%': { transform: 'translateY(12px) rotate(-1deg)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.5s ease-out',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'shake': 'shake 0.5s ease-in-out',
        'fire': 'fire 0.8s ease-in-out infinite',
        'pushup-human': 'pushup-down 1.4s ease-in-out infinite',
        'pushup-duck': 'waddle 1.2s ease-in-out infinite',
        'pushup-cow': 'moo 1.8s ease-in-out infinite',
        'pushup-frog': 'boing 1.0s ease-in-out infinite',
        'pushup-bear': 'lumber 2.0s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
