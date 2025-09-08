import type {NextConfig} from "next";
const path = require("path")

const nextConfig: NextConfig = {
    transpilePackages: ["shared"],
    webpack: (config) => {
        config.resolve.alias["shared"] = path.resolve(__dirname, "../../packages/shared")
        return config
      },
    output: 'export', // enables `next export` for Firebase Hosting
    images: {
        unoptimized: true // required for static hosting if using <Image />
    },
};

export default nextConfig;
