import type { Config } from 'tailwindcss'
import {themeColors} from "@/styles/theme";

import tailwindcss_animate from "tailwindcss-animate";

const config: Config = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
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
