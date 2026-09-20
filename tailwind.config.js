/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { ink: '#050508', panel: '#0d0c14', purple: '#9b5cff', cyan: '#5ce1ff' }, boxShadow: { neon: '0 0 34px rgba(155,92,255,.28)' } } },
  plugins: []
}
