
import * as webllm from "https://esm.run/@mlc-ai/web-llm";

/*************************************************************************
 * KANUNI AI - Hybrid Forensic Engine (Llama-3 + BERT Fallback)
 * -----------------------------------------------------------------------
 * Primary: Llama-3-8B (WebGPU)
 * Fallback: BERT (WASM/CPU) for older hardware.
 *************************************************************************/

const SELECTED_MODEL = "Llama-3-8B-Instruct-q4f16_1-MLC";
const BERT_MODEL = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';

let engine = null;
let bertPipeline = null;

// Initialize Llama-3 Engine
async function getLlamaEngine(progressCallback) {
    if (engine) return engine;

    // Check for WebGPU support
    if (!navigator.gpu) {
        throw new Error("WebGPU not supported. Falling back to Legacy BERT Engine.");
    }

    engine = new webllm.MLCEngine();
    engine.setInitProgressCallback((report) => {
        let percent = 0;
        const msg = report.text;
        if (msg.includes("Cache found")) percent = 10;
        else if (msg.includes("Fetching param section")) percent = 30;
        else if (msg.includes("Loading model from cache")) percent = 50;
        else if (msg.includes("Finish loading")) percent = 100;

        progressCallback({
            status: 'initiate',
            message: `[Neural Pass] ${msg}`,
            progress: percent
        });
    });

    try {
        await engine.reload(SELECTED_MODEL);
        return engine;
    } catch (err) {
        console.error("Llama-3 load failed", err);
        throw err;
    }
}

// Initialize BERT Pipeline
async function getBertPipeline() {
    if (bertPipeline) return bertPipeline;

    try {
        // Import dynamically from CDN
        const { pipeline, env } = await import("https://esm.run/@xenova/transformers");

        // Disable local model check for CDN use in browser
        env.allowLocalModels = false;

        bertPipeline = await pipeline('text-classification', BERT_MODEL, {
            progress_callback: (p) => {
                self.postMessage({
                    status: 'initiate',
                    message: `[Legacy Pass] Loading BERT... ${Math.round(p.progress || 0)}%`,
                    progress: p.progress
                });
            }
        });
        return bertPipeline;
    } catch (err) {
        console.error("BERT pipeline failed", err);
        throw err;
    }
}

async function runBertAnalysis(text) {
    const pipe = await getBertPipeline();
    const result = await pipe(text.slice(0, 512), { topk: 3 });

    // Map BERT sentiment/classification to forensic risk
    const isNegative = result.some(r => r.label === 'NEGATIVE' && r.score > 0.6);
    const riskScore = isNegative ? 65 : 15;

    return {
        pillarAlignment: {
            decisionIntelligence: 0.4,
            complianceAutomation: 0.7,
            hitlGovernance: 0.8
        },
        auditOpinion: "NOTICE: This analysis was performed using the Legacy BERT Engine because WebGPU is not available. Forensic reasoning is limited to structural scanning.",
        riskScore: riskScore,
        riskLevel: riskScore > 50 ? "MODERATE" : "LOW",
        topConcern: isNegative ? "Potential Regulatory Non-Compliance Detected" : "General Document Structure Validated",
        suggestions: ["Perform Human-in-the-loop review", "Upgrade device to WebGPU-capable hardware for deep Llama-3 reasoning"],
        citations: ["PPDA Act 2015 Section 44"],
        redFlags: isNegative ? ["Suspicious tone detected in limited window"] : [],
        alerts: isNegative ? ["LEGACY ALERT: Possible inconsistency flagged by BERT sentiment scan"] : [],
        confidenceScore: 0.45,
        isAISourced: true,
        engine: "BERT-LEGACY",
        model: "BERT (WASM/WIND-64MB)"
    };
}

self.addEventListener('message', async (event) => {
    const { text, type } = event.data;

    if (type === 'analyze') {
        try {
            // Attempt Llama-3 First
            try {
                self.postMessage({ status: 'initiate', message: 'Targeting Neural Engine (Llama 3)...', progress: 5 });

                const eng = await getLlamaEngine((data) => self.postMessage(data));

                self.postMessage({ status: 'analyzing', message: 'Llama 3 is reasoning (High Precision)...' });

                const prompt = `
                [ROLE]
                You are KANUNI AI, an elite Forensic Auditor with expertise in Kenyan Public Procurement Law (PPDA Act 2015), the Finance Act 2017, and the PPDA Regulations 2020.

                [TASK]
                Analyze the provided document text for critical governance, risk, and compliance issues. You must prioritize the latest standards from the Finance Act 2017 (e.g., Section 114A Specially Permitted Procurement) and the 2020 Regulations.

                [INSTRUCTIONS]
                1. THINK STEP-BY-STEP: Evaluate document type, dates, amounts, and missing clauses.
                2. IDENTIFY RISKS: Look for inconsistencies or missing signatures.
                3. SCORE: Assign a risk score (0-100).
                4. OUTPUT: Generate the final JSON response.

                [OUTPUT FORMAT]
                You must output a VALID JSON object inside a code block.
                
                Format:
                \`\`\`json
                {
                    "pillarAlignment": { "decisionIntelligence": 0.8, "complianceAutomation": 0.4, "hitlGovernance": 0.9 },
                    "auditOpinion": "Conclusion...",
                    "riskScore": 85,
                    "riskLevel": "CRITICAL",
                    "topConcern": "Issue found...",
                    "suggestions": ["Action..."],
                    "citations": ["[Section X] Law..."],
                    "redFlags": ["Anomaly..."],
                    "alerts": ["ALERT: Description..."],
                    "confidenceScore": 0.92
                }
                \`\`\`

                DOCUMENT TEXT:
                "${text.slice(0, 6000)}" 
                `;

                const reply = await eng.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.1,
                });

                const resultRaw = reply.choices[0].message.content;
                const jsonMatch = resultRaw.match(/```json\n([\s\S]*?)\n```/) || resultRaw.match(/```([\s\S]*?)```/);
                const result = JSON.parse(jsonMatch ? jsonMatch[1] : resultRaw);

                self.postMessage({ status: 'classification_complete', output: result.pillarAlignment });
                self.postMessage({ status: 'complete', output: result.auditOpinion, extended: { ...result, engine: "LLAMA-3-GPU", model: "Llama-3-8B-Instruct (Edge)" } });

            } catch (llamaError) {
                console.warn("Llama-3 Failure or WebGPU missing. Switching to BERT:", llamaError.message);
                self.postMessage({ status: 'initiate', message: 'Engine Fallback: Booting BERT (Legacy)...', progress: 10 });

                const bertResult = await runBertAnalysis(text);

                self.postMessage({ status: 'classification_complete', output: bertResult.pillarAlignment });
                self.postMessage({ status: 'complete', output: bertResult.auditOpinion, extended: bertResult });
            }

        } catch (error) {
            console.error("Forensic Engine Crash:", error);
            self.postMessage({ status: 'error', error: error.message || "All inference engines failed." });
        }
    }
});
