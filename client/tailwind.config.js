/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F0C84A',
          dark: '#A88C25',
          muted: 'rgba(212, 175, 55, 0.15)',
        },
        dark: {
          bg: '#0B0B0B',
          card: '#121212',
          border: '#1E1E1E',
          hover: '#1A1A1A',
          surface: '#161616',
        },
        profit: '#10B981',
        loss: '#EF4444',
        neutral: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F0C84A 50%, #A88C25 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0B0B0B 0%, #121212 100%)',
        'hero-gradient': 'linear-gradient(to bottom, rgba(11,11,11,0.3) 0%, rgba(11,11,11,0.7) 60%, rgba(11,11,11,1) 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212, 175, 55, 0.15)',
        'gold-lg': '0 0 40px rgba(212, 175, 55, 0.25)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
