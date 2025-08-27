// tailwind.config.js

module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}', // Add paths to your files
  ],
  theme: {
    extend: {
      animation: {
        marquee: 'marquee 20s linear infinite', // Marquee animation (duration: 10 seconds)
      },
      keyframes: {
        marquee: {
          '0%': {
            transform: 'translateX(100%)', // Start at the far right
          },
          '100%': {
            transform: 'translateX(-100%)', // End at the far left
          },
        },
      },
    },
  },
  plugins: [],
};