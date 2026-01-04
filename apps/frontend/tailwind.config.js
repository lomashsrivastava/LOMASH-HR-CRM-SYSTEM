/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neon: {
                    cyan: '#00f3ff',
                    magenta: '#ff00ff',
                    violet: '#9d00ff',
                    dark: '#0a0a0f',
                    surface: '#13131f',
                }
            },
            boxShadow: {
                'neon-cyan': '0 0 10px #00f3ff, 0 0 20px #00f3ff',
                'neon-magenta': '0 0 10px #ff00ff, 0 0 20px #ff00ff',
            }
        },
    },
    plugins: [],
}
