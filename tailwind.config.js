/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'medical-blue': '#0056b3',
        'light-blue': '#e1f5fe',
        'accent-green': '#28a745',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
