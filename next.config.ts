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

            // Ensure @xenova/transformers is bundled correctly
            config.resolve = config.resolve || {};
            config.resolve.extensionAlias = {
                '.js': ['.js', '.ts', '.tsx'],
            };
        }
        return config;
    }
};

export default nextConfig;
