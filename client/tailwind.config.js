/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: '#D4FF3A',
        'brand-dark': '#B5E024',
        'brand-deep': '#7A9900',
        dark: '#0E1116',
        surface: '#FFFFFF',
        bg: '#F4F5F7',
        bg2: '#ECEEF2',
        'v3-border': '#EEF0F3',
        'v3-border-strong': '#E2E5EA',
        'v3-text': '#0E1116',
        'v3-text2': '#4A4F58',
        'v3-mute': '#8A8F99',
        'v3-dim': '#B8BCC4',
        'v3-purple': '#7B5CFF',
        'v3-purple-dark': '#5A3EE0',
        'v3-orange': '#FF8A4C',
        'v3-blue': '#4BA3FF',
        'v3-green': '#42C281',
        'v3-red': '#FF5A5A',
        success: '#42C281',
      },
      fontFamily: {
        sans: ['Archivo', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Archivo Black', 'Archivo', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'v3-sm': '12px',
        'v3': '18px',
        'v3-lg': '24px',
        'v3-xl': '32px',
      },
    },
  },
  plugins: [],
}
