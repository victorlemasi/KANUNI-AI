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

export async function analyzeText(text: string) {
    const classifier = await getClassifier();

    const labels = [
        "procurement risk",
        "compliance violation",
        "vendor concentration",
        "fraudulent activity",
        "audit readiness",
        "legal framework alignment"
    ];

    // Truncate text if needed (BERT has limits)
    const truncatedText = text.substring(0, 1000);

    const result = await classifier(truncatedText, labels);

    const riskScore = parseFloat((result.scores[0] * 100).toFixed(1));
    const topConcern = result.labels[0];

    // Generate Dynamic Suggestions based on Risk & Labels
    const suggestions = [];
    if (riskScore > 30) suggestions.push("Initiate secondary vendor verification.");
    if (topConcern.includes("violation")) suggestions.push("Review PFM Act Section 42 compliance.");
    if (topConcern.includes("fraud")) suggestions.push("Escalate to Internal Audit AI Assistant.");
    if (riskScore < 15) suggestions.push("Proceed with standard workflow; document Decision Log.");

    // Decision Intelligence & Early Warning
    const response = {
        riskScore,
        topConcern,
        suggestions,
        pillarAlignment: {
            decisionIntelligence: result.scores[0],
            complianceAutomation: result.scores[result.labels.indexOf("audit readiness")] || 0.4,
            hitlGovernance: 0.85,
        },
        alerts: riskScore > 50 ? [`EARLY WARNING: High potential for ${topConcern}`] : [],
        auditTrail: {
            model: "mobilebert-uncased-mnli",
            inferenceTime: Date.now(),
            confidence: result.scores[0]
        }
    };

    return response;
}
