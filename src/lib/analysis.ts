import { pipeline } from "@xenova/transformers";

let classifier: any = null;

export async function getClassifier() {
    if (!classifier) {
        console.log("Loading BERT model (Xenova/mobilebert-uncased-mnli)...");
        // Using a lightweight BERT model for zero-shot classification
        classifier = await pipeline("zero-shot-classification", "Xenova/mobilebert-uncased-mnli");
        console.log("BERT model loaded successfully.");
    }
    return classifier;
}

export async function analyzeText(text: string, type: 'procurement' | 'contract' = 'procurement') {
    const classifier = await getClassifier();

    let labels: string[] = [];
    let suggestions: string[] = [];
    let riskScore = 0;
    let topConcern = "";
    let truncatedText = text.substring(0, 1000);

    if (type === 'contract') {
        // Contract Mode: Clause Detection
        const clauses = [
            "termination clause",
            "indemnity protection",
            "limitation of liability",
            "confidentiality agreement",
            "governing law"
        ];

        // Use BERT to see which clauses are present/strong
        const result = await classifier(truncatedText, clauses);

        // Simple heuristic: if top scores are low, clause might be missing or weak
        const missingClauses = clauses.filter((c, i) => {
            const score = result.scores[result.labels.indexOf(c)];
            return score < 0.2; // Threshold for "missing/weak"
        });

        if (missingClauses.length > 0) {
            riskScore = 65 + (missingClauses.length * 5); // Base risk + penalty
            topConcern = `Missing critical clauses: ${missingClauses[0]}`;
            suggestions = missingClauses.map(c => `Drafting needed: Insert standard ${c}.`);
        } else {
            riskScore = 15;
            topConcern = "Standard clauses detected";
            suggestions.push("Proceed with legal review integration.");
        }

        // Additional risky term check
        if (text.toLowerCase().includes("unlimited liability")) {
            riskScore = 95;
            topConcern = "CRITICAL: Unlimited Liability detected";
            suggestions.unshift("IMMEDIATE: Renegotiate liability cap.");
        }

    } else {
        // Default Procurement Mode
        labels = [
            "procurement risk",
            "compliance violation",
            "vendor concentration",
            "fraudulent activity",
            "audit readiness"
        ];
        const result = await classifier(truncatedText, labels);
        riskScore = parseFloat((result.scores[0] * 100).toFixed(1));
        topConcern = result.labels[0];

        if (riskScore > 30) suggestions.push("Initiate secondary vendor verification.");
        if (topConcern.includes("violation")) suggestions.push("Review PFM Act Section 42 compliance.");
        if (topConcern.includes("fraud")) suggestions.push("Escalate to Internal Audit AI Assistant.");
        if (riskScore < 15) suggestions.push("Proceed with standard workflow; document Decision Log.");
    }

    // Decision Intelligence & Early Warning
    const response = {
        riskScore,
        topConcern,
        suggestions,
        pillarAlignment: {
            decisionIntelligence: riskScore > 50 ? 0.3 : 0.85,
            complianceAutomation: type === 'contract' ? 0.9 : 0.6,
            hitlGovernance: 0.85,
        },
        alerts: riskScore > 50 ? [`EARLY WARNING: High potential for ${topConcern}`] : [],
        auditTrail: {
            model: "mobilebert-uncased-mnli",
            inferenceTime: Date.now(),
            confidence: 0.95
        }
    };

    return response;
}
