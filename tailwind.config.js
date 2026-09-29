/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace']
      },
      colors: {
        void: '#07090c',
        panel: '#10151c',
        inset: '#0c1016',
        line: '#243040',
        teal: {
          DEFAULT: '#2ee6c7',
          dim: '#1a8f7c'
        },
        amberx: '#f5a623'
      }
    },
  },
  plugins: [],
}
