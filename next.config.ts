import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    //output: 'export', // enables `next export`
    output: 'standalone',
    images: {
        unoptimized: true // required for static hosting if using <Image />
    }
};

export default nextConfig;
