import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ["sharp", "onnxruntime-node", "@xenova/transformers", "pdf-parse", "mammoth"],
    output: 'standalone',
    images: {
        unoptimized: true,
    }
};

export default nextConfig;
