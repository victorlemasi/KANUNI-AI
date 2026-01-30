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

    // Aggressive Purge: Wipe existing cache to ensure only required quantized models are kept
    console.log("🧹 Wiping legacy build cache...");
    if (fs.existsSync(cacheDir)) {
        fs.rmSync(cacheDir, { recursive: true, force: true });
    }
    fs.mkdirSync(cacheDir, { recursive: true });

    try {
        console.log("📥 Downloading mobilebert-uncased-mnli (Quantized) model...");
        await pipeline("zero-shot-classification", "Xenova/mobilebert-uncased-mnli", { quantized: true });

        console.log("📥 Downloading LaMini-Flan-T5-77M (Quantized) model...");
        await pipeline("text2text-generation", "Xenova/LaMini-Flan-T5-77M", { quantized: true });

        console.log("✅ All models downloaded and cached successfully!");
    } catch (error) {
        console.error("❌ Failed to pre-download model:", error);
        process.exit(1);
    }
}

preDownload();
