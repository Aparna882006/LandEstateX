/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#10192E',
          700: '#1A2B4C',
          500: '#2E4374',
          100: '#E8ECF5',
        },
        accent: {
          600: '#D98E00',
          100: '#FBEACD',
        },
        neutral: {
          0: '#FAFAF8',
          50: '#F2F1ED',
          200: '#E4E2DC',
          500: '#8A8878',
          900: '#1C1C1E',
        },
        success: { 600: '#1F8A5A' },
        warning: { 600: '#C77D14' },
        danger: { 600: '#C4392B' },
        info: { 600: '#2E6FBA' },
      },
      borderRadius: {
        sm: '6px', md: '8px', lg: '12px', xl: '16px',
      },
    },
  },
  plugins: [],
}