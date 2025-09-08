import type { Config } from 'tailwindcss'

import tailwindcss_animate from "tailwindcss-animate";
import { themeColors } from './styles/theme';

const config: Config = {
    content: [
        "./apps/**/src/**/*.{js,ts,jsx,tsx,mdx}",
        "./packages/shared/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
        extend: {
            colors: themeColors,
            fontFamily: {
                sans: ['Inter', 'sans-serif']
            },
            backgroundImage: {
                'hero-pattern': "url('/assets/images/background.png')"
            }
        }
    },
    plugins: [tailwindcss_animate],
}
export default config
