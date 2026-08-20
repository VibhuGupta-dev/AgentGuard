/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0b0d", // Dark background
        foreground: "#f3f4f6",
        card: {
          DEFAULT: "#12141c",
          border: "#202430",
        },
        primary: {
          DEFAULT: "#4f46e5", // Indigo
          hover: "#4338ca",
        },
        status: {
          pass: "#10b981",
          fail: "#ef4444",
          partial: "#f59e0b",
          queued: "#3b82f6",
          running: "#8b5cf6",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
