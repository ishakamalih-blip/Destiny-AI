/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#050510', // Deepest Space
          dark: '#0f0c29', // Deep Indigo/Night Sky
          light: '#1a1a2e', // Lighter Night
          primary: '#00d2ff', // Starlight Blue
          secondary: '#9d50bb', // Nebula Purple
          accent: '#00d2ff', // Tech Blue
          text: '#e0e0e0', // Stardust White
          dim: '#a0a0b0', // Moonlit Grey
        }
      },
      fontFamily: {
        sci: ['"Space Grotesk"', 'sans-serif'], // Technical Headings
        tech: ['"Quicksand"', 'sans-serif'], // Clean Modern Body
        mono: ['"Space Mono"', 'monospace']
      },
      boxShadow: {
        'neon-blue': '0 0 10px #00d2ff, 0 0 20px #00d2ff',
        'neon-purple': '0 0 10px #9d50bb, 0 0 20px #9d50bb',
        'tech-glow': '0 0 15px rgba(0, 210, 255, 0.5), 0 0 30px rgba(0, 210, 255, 0.3)',
      },
      backgroundImage: {
        'tech-gradient': 'linear-gradient(to right, #0f0c29, #302b63, #24243e)',
        'blue-gradient': 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
      },
    },
  },
  plugins: [],
}
