/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pictionary-blue': '#1E90FF',
        'pictionary-red': '#FF4444',
        'pictionary-yellow': '#FFD700',
        'pictionary-green': '#32CD32',
      },
    },
  },
  plugins: [],
  // Ensure JIT mode is enabled for better performance
  mode: 'jit',
  // Important: This ensures that Tailwind's utilities take precedence
  important: true,
} 