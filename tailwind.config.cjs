/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          50: '#F5F7FF',
          100: '#EEF2FF',
          600: '#4F46E5'
        },
        accent: '#7C3AED',
        surface: '#F8FAFC',
        sidebar: '#EEF2FF',
        menu: '#EEF2FF',
        danger: '#EF4444'
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.05), 0 8px 20px rgba(16,24,40,0.04)'
      }
    }
  },
  plugins: []
}
