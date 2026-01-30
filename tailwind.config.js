export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      animation: {
        fadeOut: "fadeOut 2s forwards",
        fadeOutSlow: "fadeOut 2.35s forwards",
      },
      keyframes: {
        fadeOut: {
          to: { opacity: 0 }
        }
      },
      fontSize: {
        '2xs': '0.625rem', // 10px
      }
    },
  },
  plugins: [],
  safelist: [
    'glitch-effect'
  ]
}



