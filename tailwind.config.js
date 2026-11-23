/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#030712',
        card: {
          DEFAULT: '#0F172A',
          border: '#1E293B',
        },
        surface: {
          elevated: '#1E293B',
        },
        foreground: '#F8FAFC',
        'muted-foreground': '#94A3B8',
        brand: {
          DEFAULT: '#4F46E5',
          hover: '#6366F1',
          light: '#818CF8',
          dark: '#3730A3',
        },
        success: {
          DEFAULT: '#10B981',
          hover: '#059669',
          light: '#34D399',
        },
        danger: {
          DEFAULT: '#EF4444',
          hover: '#DC2626',
          light: '#F87171',
        },
        warning: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: '#FBBF24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
