import type { Config } from 'tailwindcss'

export default {
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#eef7ff',
					100: '#d9ecff',
					200: '#b9dbff',
					300: '#8ac5ff',
					400: '#57a7ff',
					500: '#2f86ff',
					600: '#1767f2',
					700: '#124fcb',
					800: '#1243a2',
					900: '#143a82',
					950: '#0d2350'
				}
			},
			boxShadow: {
				soft: '0 8px 30px rgba(0,0,0,0.08)'
			}
		}
	},
	plugins: []
} satisfies Config


