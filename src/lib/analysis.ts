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

export async function analyzeText(text: string, type: 'procurement' | 'contract' | 'fraud' = 'procurement') {
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

    } else if (type === 'fraud') {
        // Fraud Mode: Financial Anomalies
        riskScore = 10; // Baseline
        topConcern = "Standard financial patterns";

        // 1. Detect Round Amounts (Benford's Law red flag)
        const roundAmountRegex = /\b\d{1,3}(,\d{3})*(\.00)?\b/g;
        const matches = text.match(roundAmountRegex) || [];
        const cleanMatches = matches.filter(m => {
            const num = parseInt(m.replace(/,/g, ''));
            return num > 1000 && num % 1000 === 0; // Huge round numbers
        });

        if (cleanMatches.length > 0) {
            riskScore += 40;
            topConcern = "Suspicious round-dollar amounts detected";
            suggestions.push(`Verify evidence for round amounts: ${cleanMatches.slice(0, 3).join(', ')}`);
        }

        // 2. High-Risk Keywords for Fraud/Bribery
        const fraudKeywords = ["facilitation", "expedite", "cash", "bearer", "gift", "consulting fee", "urgent", "private"];
        const foundKeywords = fraudKeywords.filter(k => text.toLowerCase().includes(k));

        if (foundKeywords.length > 0) {
            riskScore += (foundKeywords.length * 15);
            topConcern = `Fraud risk indicators found: ${foundKeywords[0]}`;
            suggestions.push(`Investigate usage of terms: ${foundKeywords.join(', ')}`);
        }

        riskScore = Math.min(riskScore, 99); // Cap at 99

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
