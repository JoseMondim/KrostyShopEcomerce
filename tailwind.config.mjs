/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0a', // Very dark background
                surface: '#18181b', // Slightly lighter for cards/sections
                primary: '#f59e0b', // Amber/Orange for buttons/highlights
                secondary: '#3b82f6', // Blue accent (optional, keeping for now)
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'], // Modern sans-serif
            }
        },
    },
    plugins: [],
}
