/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 700: '#334155', 800: '#1e293b', 900: '#0f172a' }, // Primary/Sidebar
        amber: { 500: '#f59e0b', 600: '#d97706' }, // Accent/Progress
        teal: { 600: '#0d9488' }, // Success
        slate: { 50: '#f8fafc', 100: '#f1f599', 200: '#e2e8f0', 500: '#64748b', 900: '#0f172a' } // Grays
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] }
    },
  },
  plugins: [],
}