/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000", // Pure black background
        foreground: "#f5f5f5",
        card: {
          DEFAULT: "#0a0a0a",
          border: "#1a1a1a",
        },
        primary: {
          DEFAULT: "#ff5a00", // Orange
          hover: "#e04f00",
        },
        status: {
          pass: "#10b981",
          fail: "#ef4444",
          partial: "#f59e0b",
          queued: "#3b82f6",
          running: "#ff5a00",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
