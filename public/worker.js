
import * as webllm from "https://esm.run/@mlc-ai/web-llm";

/*************************************************************************
 * KANUNI AI - Client-Side Forensic Engine (WebLLM)
 * -----------------------------------------------------------------------
 * Runs Llama-3-8B directly in browser. ZERO Server CPU. 100% Privacy.
 *************************************************************************/

const SELECTED_MODEL = "Llama-3-8B-Instruct-q4f32_1-MLC";

let engine = null;
let pipelinePromise = null;

// Initialize the engine once
async function getEngine(progressCallback) {
    if (engine) return engine;

    // Create new engine
    engine = new webllm.MLCEngine();

    // Set reload handler to track progress
    engine.setInitProgressCallback((report) => {
        // Map string progress to number for UI
        let percent = 0;
        const msg = report.text;

        // Simple heuristic for progress bar
        if (msg.includes("Cache found")) percent = 10;
        else if (msg.includes("Fetching param section")) {
            // Extract X/Y if possible or just bump
            percent = 30;
        } else if (msg.includes("Loading model from cache")) {
            percent = 50;
        } else if (msg.includes("Finish loading")) {
            percent = 100;
        }

        progressCallback({
            status: 'initiate', // Use 'initiate' to show loading bar in UI
            message: `[Llama-3] ${msg}`,
            progress: percent
        });
    });

    try {
        await engine.reload(SELECTED_MODEL);
    } catch (err) {
        console.error("Model load failed", err);
        throw err;
    }

    return engine;
}


self.addEventListener('message', async (event) => {
    const { text, type } = event.data;

    if (type === 'analyze') {
        try {
            self.postMessage({ status: 'initiate', message: 'Booting Neural Engine (Llama 3)...', progress: 5 });

            const eng = await getEngine((data) => self.postMessage(data));

            self.postMessage({ status: 'analyzing', message: 'Llama 3 is reading the document...' });

            // 1. Construct the Prompt
            const prompt = `
            You are KANUNI AI, a high-precision forensic auditor.
            Analyze the following document text for governance, risk, and compliance issues.
            
            Focus on these 3 pillars:
            1. Decision Intelligence (Is the data clear for decision making?)
            2. Compliance Automation (Does it follow standard formats/rules?)
            3. HITL Governance (Does it need human review?)

            Output a JSON object ONLY with this structure:
            {
                "pillarAlignment": {
                    "decisionIntelligence": 0.0 to 1.0,
                    "complianceAutomation": 0.0 to 1.0,
                    "hitlGovernance": 0.0 to 1.0
                },
                "auditOpinion": "A 1-sentence professional audit opinion.",
                "riskScore": 0 to 100,
                "topConcern": "Short phrase describing top risk",
                "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
            }

            DOCUMENT TEXT:
            "${text.slice(0, 6000)}" 
            `;
            // Truncate to avoid context overflow if huge, though Llama 3 has 8k context.

            const reply = await eng.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }, // Force JSON
                temperature: 0.1, // Low temp for factual audit
            });

            const resultRaw = reply.choices[0].message.content;
            let result;
            try {
                result = JSON.parse(resultRaw);
            } catch (e) {
                // Fallback if JSON parse fails
                console.warn("JSON Parse failed, using fallback", e);
                result = {
                    pillarAlignment: { decisionIntelligence: 0.5, complianceAutomation: 0.5, hitlGovernance: 0.5 },
                    auditOpinion: "Analysis completed but structured output was malformed. Review manually.",
                    riskScore: 50,
                    topConcern: "Manual Review Required",
                    suggestions: ["Verify document integrity", "Check format compliance"]
                };
            }

            // Remap for UI compatibility
            self.postMessage({
                status: 'classification_complete',
                output: result.pillarAlignment
            });

            self.postMessage({
                status: 'complete',
                output: result.auditOpinion,
                // We can send extra data if we modify FileUpload.tsx to accept it, 
                // but for now we stick to the existing contract: 
                // status: 'complete' -> output is the opinion.
                // We might need to send the other fields too.
                extended: result
            });

        } catch (error) {
            console.error(error);
            self.postMessage({ status: 'error', error: error.message || "Model Inference Failed" });
        }
    }
});
