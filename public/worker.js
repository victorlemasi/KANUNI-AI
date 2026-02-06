
import * as webllm from "https://esm.run/@mlc-ai/web-llm";

/*************************************************************************
 * KANUNI AI - Client-Side Forensic Engine (WebLLM)
 * -----------------------------------------------------------------------
 * Runs Llama-3-8B directly in browser. ZERO Server CPU. 100% Privacy.
 *************************************************************************/

const SELECTED_MODEL = "Llama-3-8B-Instruct-q4f16_1-MLC";

let engine = null;

// Initialize the engine once
async function getEngine(progressCallback) {
    if (engine) return engine;

    // Create new engine
    engine = new webllm.MLCEngine();

    // Set reload handler to track progress
    engine.setInitProgressCallback((report) => {
        let percent = 0;
        const msg = report.text;

        if (msg.includes("Cache found")) percent = 10;
        else if (msg.includes("Fetching param section")) percent = 30;
        else if (msg.includes("Loading model from cache")) percent = 50;
        else if (msg.includes("Finish loading")) percent = 100;

        progressCallback({
            status: 'initiate',
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

            self.postMessage({ status: 'analyzing', message: 'Llama 3 is reasoning (Chain-of-Thought)...' });

            // --- CHAIN OF THOUGHT PROMPT ENGINEERING ---
            const prompt = `
            [ROLE]
            You are KANUNI AI, an elite Forensic Auditor with expertise in Procurement Law (PPDA), Contract Law, and Fraud Detection.

            [TASK]
            Analyze the provided document text for critical governance, risk, and compliance issues.
            
            [INSTRUCTIONS]
            1.  **THINK STEP-BY-STEP**: First, mentally evaluate the document type, key dates, monetary values, and missing clauses.
            2.  **IDENTIFY RISKS**: Look for inconsistencies, vagueness, or missing signatures.
            3.  **SCORE**: Assign a risk score (0-100) based on severity.
            4.  **OUTPUT**: Generate the final JSON response.

            [PILLARS TO EVALUATE]
            1.  **Decision Intelligence**: Is the data actionable? Are figures and dates clear?
            2.  **Compliance Automation**: Does it adhere to standard legal formats?
            3.  **HITL Governance**: Is human review strictly necessary due to ambiguity?

            [STRICT FORENSIC GUIDELINES]
            - **NO GENERIC ADVICE**: Do NOT use phrases like "Award must be based on lowest price" or "Report to authorities".
            - **EVIDENCE ONLY**: Every finding must reference data *actually found* in the text. (e.g., "Invoice #123 matches Vendor B but is dated before the contract").
            - **CRITICAL ALERTS**: If you find specific fraud or corruption markers, list them in the "alerts" array.

            [OUTPUT FORMAT]
            You must output a VALID JSON object inside a code block.
            
            Example Format:
            \`\`\`json
            {
                "pillarAlignment": {
                    "decisionIntelligence": 0.8,
                    "complianceAutomation": 0.4,
                    "hitlGovernance": 0.9
                },
                "auditOpinion": "Specific forensic conclusion...",
                "riskScore": 85,
                "riskLevel": "CRITICAL",
                "topConcern": "Exact issue found in text (e.g., Date Mismatch in Clause 4)",
                "suggestions": ["Specific action for this document", "Another specific action"],
                "citations": ["[Section X] Contextual legal breach"],
                "redFlags": ["Specific anomaly found", "Another data-driven flag"],
                "alerts": ["SPECIFIC ANOMALY: Description of evidence"],
                "confidenceScore": 0.92
            }
            \`\`\`

            DOCUMENT TEXT:
            "${text.slice(0, 6000)}" 
            `;

            // Allow model to "think" by setting temperature slightly higher for reasoning, but low for structure
            const reply = await eng.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                // We REMOVE response_format: { type: "json_object" } because we want CoT text first, 
                // or we accept md-json. We'll extract carefully.
                temperature: 0.2,
            });

            const resultRaw = reply.choices[0].message.content;
            console.log("[Llama-3 Raw Output]:", resultRaw);

            // --- ROBUST JSON EXTRACTION ---
            let result;
            try {
                // 1. Try finding JSON block
                const jsonMatch = resultRaw.match(/```json\n([\s\S]*?)\n```/) || resultRaw.match(/```([\s\S]*?)```/);
                if (jsonMatch && jsonMatch[1]) {
                    result = JSON.parse(jsonMatch[1]);
                } else {
                    // 2. Try parsing the whole thing if pure JSON
                    result = JSON.parse(resultRaw);
                }
            } catch (e) {
                // 3. Fallback: Heuristic extraction
                console.warn("JSON Extraction failed. Attempting deep cleanup...");
                try {
                    const firstBrace = resultRaw.indexOf('{');
                    const lastBrace = resultRaw.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1) {
                        const clean = resultRaw.substring(firstBrace, lastBrace + 1);
                        result = JSON.parse(clean);
                    }
                } catch (e2) {
                    console.error("Critical JSON failure", e2);
                }
            }

            if (!result) {
                throw new Error("Failed to generate structured forensic data.");
            }

            // Remap for UI compatibility
            self.postMessage({
                status: 'classification_complete',
                output: result.pillarAlignment
            });

            self.postMessage({
                status: 'complete',
                output: result.auditOpinion,
                extended: result
            });

        } catch (error) {
            console.error(error);
            self.postMessage({ status: 'error', error: error.message || "Model Inference Failed" });
        }
    }
});
