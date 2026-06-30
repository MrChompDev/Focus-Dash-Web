/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#6C63FF',
        'accent-hover': '#7B73FF',
        surface: '#1e1e1e',
        'surface-dark': '#0a0a0f',
        'surface-light': '#2d2d2d',
        'surface-hover': '#3d3d3d',
        muted: '#808098',
        dim: '#505068',
        'text-primary': '#e0e0e0',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
