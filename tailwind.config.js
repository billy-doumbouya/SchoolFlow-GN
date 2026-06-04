/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          200: '#b9ccff',
          300: '#84a9ff',
          400: '#527aff',
          500: '#2b50f5',
          600: '#1a3aeb',
          700: '#1530d0',
          800: '#1728a9',
          900: '#192884',
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle:  '#f8fafc',
          muted:   '#f1f5f9',
          border:  '#e2e8f0',
        },
      },
      fontFamily: {
        sans:    ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-dm-serif)', 'Georgia', 'serif'],
        mono:    ['var(--font-geist-mono)', 'ui-monospace'],
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        panel: '0 4px 24px -4px rgb(0 0 0 / 0.10)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
