/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#3fb950',
        danger: '#f85149',
        surface: 'rgba(255, 255, 255, 0.05)',
        text: '#ffffff',
        muted: '#8b949e',
        background: '#0d1117',
      }
    },
  },
  plugins: [],
}