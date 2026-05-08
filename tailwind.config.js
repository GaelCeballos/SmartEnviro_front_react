/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#18B79B',
        background: '#F4F7F6',
        surface: '#FFFFFF',
        textDark: '#1A2B3C',
        textLight: '#8B9CA7',
      }
    },
  },
  plugins: [],
}