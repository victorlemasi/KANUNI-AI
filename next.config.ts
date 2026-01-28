import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ["sharp", "onnxruntime-node", "@xenova/transformers"],
};

export default nextConfig;
