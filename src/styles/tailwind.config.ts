import type { Config } from 'tailwindcss'
import {themeColors} from "@/styles/theme";

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
    plugins: []
}
export default config
