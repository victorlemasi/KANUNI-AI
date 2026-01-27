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

    // Map scores to our platform pillars
    const response = {
        riskScore: (result.scores[0] * 100).toFixed(1),
        topConcern: result.labels[0],
        pillarAlignment: {
            decisionIntelligence: result.scores[0],
            complianceAutomation: result.scores[result.labels.indexOf("audit readiness")],
            hitlGovernance: 0.85, // Placeholder for human-in-the-loop confidence
        },
        alerts: result.scores[0] > 0.5 ? [`High risk detected: ${result.labels[0]}`] : []
    };

    return response;
}
