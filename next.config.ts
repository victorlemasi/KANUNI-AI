import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ["sharp", "onnxruntime-node"],
    output: 'standalone',
    images: {
        unoptimized: true,
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            // Ignore canvas module to prevent DOMMatrix errors
            config.externals.push({
                canvas: 'commonjs canvas',
            });
        }
        return config;
    }
};

export default nextConfig;
