import { pipeline, env } from "@xenova/transformers";
import fs from "fs";
import path from "path";

// Set cache directory to a local folder in the project root
// This ensures it gets bundled in the standalone output
const cacheDir = path.join(process.cwd(), ".cache");
env.cacheDir = cacheDir;

async function preDownload() {
    console.log("🚀 Starting AI model pre-download...");
    console.log(`📂 Cache directory: ${cacheDir}`);

    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    try {
        console.log("📥 Downloading mobilebert-uncased-mnli model...");
        // This triggers the download and caches it in cacheDir
        await pipeline("zero-shot-classification", "Xenova/mobilebert-uncased-mnli");
        console.log("✅ Model downloaded and cached successfully!");
    } catch (error) {
        console.error("❌ Failed to pre-download model:", error);
        process.exit(1);
    }
}

preDownload();
