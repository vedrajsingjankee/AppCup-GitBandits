module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        accent: '#06b6d4',
        skysoft: '#7dd3fc',
        indigoglass: '#6366f1'
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
          '100%': { transform: 'translateY(0px)' }
        },
        pulsefast: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' }
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        pulsefast: 'pulsefast 1.2s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
