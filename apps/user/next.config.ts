import type {NextConfig} from "next";
import path from "path";

const nextConfig: NextConfig = {
    output: 'export', // enables `next export` for Firebase Hosting
    transpilePackages: ["shared"],
    images: {
        unoptimized: true // required for static hosting if using <Image />
    },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': path.resolve(__dirname, './src/'),
            '@shared': path.resolve(__dirname, '../../packages/shared/src'),
            '@shared/components': path.resolve(__dirname, '../../packages/shared/src/components'),
            '@shared/hooks': path.resolve(__dirname, '../../packages/shared/src/hooks'),
            '@shared/services': path.resolve(__dirname, '../../packages/shared/src/services'),
            '@shared/lib': path.resolve(__dirname, '../../packages/shared/src/lib'),
            '@shared/types': path.resolve(__dirname, '../../packages/shared/src/types'),
            '@shared/utils': path.resolve(__dirname, '../../packages/shared/src/utils'),
            '@shared/contexts': path.resolve(__dirname, '../../packages/shared/src/contexts'),
        };
        return config;
    },
};

export default nextConfig;
