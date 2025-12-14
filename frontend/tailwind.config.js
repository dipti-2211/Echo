/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Neutral & Clean Palette
                richBlack: '#09090b',
                darkZinc: '#18181b',
                subtleGrey: '#27272a',
                mutedGrey: '#a1a1aa',
                primaryWhite: '#fafafa',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'gradient': 'gradient 15s ease infinite',
                'bounce-dot': 'bounceDot 1.4s ease-in-out infinite',
                'fadeIn': 'fadeIn 0.3s ease-in',
                'scaleIn': 'scaleIn 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                bounceDot: {
                    '0%, 80%, 100%': {
                        transform: 'scale(0)',
                        opacity: '0.5',
                    },
                    '40%': {
                        transform: 'scale(1)',
                        opacity: '1',
                    },
                },
                scaleIn: {
                    '0%': {
                        opacity: '0',
                        transform: 'scale(0.95) translateY(-10px)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'scale(1) translateY(0)',
                    },
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            /* Premium: Dynamic viewport height support */
            height: {
                'screen-dvh': '100dvh',
            },
            minHeight: {
                'screen-dvh': '100dvh',
            },
        },
    },
    plugins: [],
}