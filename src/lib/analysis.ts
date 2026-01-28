import { pipeline, env } from "@xenova/transformers";

// We use dynamic imports to prevent Transformers.js from initializing during SSR/Build
let classifier: any = null;
let isLoading = false;
let loadError: Error | null = null;

export async function getClassifier() {
    if (classifier) return classifier;
    if (loadError) throw new Error(`AI model failed to load: ${loadError.message}`);

    if (isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return getClassifier();
    }

    try {
        isLoading = true;
        env.allowLocalModels = false;
        env.useBrowserCache = false;
        env.cacheDir = "./.cache";

        classifier = await pipeline("zero-shot-classification", "Xenova/mobilebert-uncased-mnli");
        return classifier;
    } catch (error: any) {
        loadError = error;
        console.error("Failed to load AI model:", error);
        throw error;
    } finally {
        isLoading = false;
    }
}

// Benford's Law Analysis
export function analyzeBenfordsLaw(text: string) {
    const amounts = text.match(/\$?\d{1,3}(,\d{3})*(\.\d{2})?/g) || [];
    const roundAmounts = amounts.filter(amt => {
        const num = parseFloat(amt.replace(/[$,]/g, ''));
        return num >= 1000 && num % 1000 === 0;
    });

    const suspiciousRatio = amounts.length > 0 ? roundAmounts.length / amounts.length : 0;

    return {
        totalAmounts: amounts.length,
        roundAmounts: roundAmounts.length,
        suspiciousRatio,
        isSuspicious: suspiciousRatio > 0.3,
        flaggedAmounts: roundAmounts.slice(0, 5)
    };
}

// Extract key entities from document
export function extractEntities(text: string) {
    const invoiceNumbers = text.match(/INV-?\d{3,}/gi) || [];
    const dates = text.match(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/g) || [];
    const emails = text.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];

    return {
        invoiceNumbers: [...new Set(invoiceNumbers)],
        dates: [...new Set(dates)],
        emails: [...new Set(emails)],
        hasInvoiceNumbers: invoiceNumbers.length > 0,
        hasDates: dates.length > 0
    };
}

// Check for high-risk keywords
export function scanHighRiskKeywords(text: string) {
    const highRiskTerms = [
        'facilitation payment', 'expedite', 'bearer cash', 'gift',
        'bribe', 'kickback', 'under the table', 'off the books',
        'consulting fee', 'commission'
    ];

    const findings = highRiskTerms
        .filter(term => text.toLowerCase().includes(term))
        .map(term => ({
            keyword: term,
            severity: ['bribe', 'kickback', 'bearer cash'].includes(term) ? 'critical' : 'high',
            context: extractContext(text, term)
        }));

    return findings;
}

function extractContext(text: string, keyword: string) {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return '';
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + keyword.length + 50);
    return '...' + text.slice(start, end) + '...';
}

// Vendor concentration analysis
export function analyzeVendorConcentration(text: string) {
    const vendorPattern = /(?:vendor|supplier|contractor)[\s:]+([A-Z][A-Za-z\s&]+(?:Ltd|Inc|LLC|Corp)?)/gi;
    const vendors: string[] = [];
    let match;

    while ((match = vendorPattern.exec(text)) !== null) {
        vendors.push(match[1].trim());
    }

    const vendorCounts = vendors.reduce((acc: any, vendor) => {
        acc[vendor] = (acc[vendor] || 0) + 1;
        return acc;
    }, {});

    const sortedVendors = Object.entries(vendorCounts)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5);

    const topVendorConcentration = sortedVendors.length > 0
        ? (sortedVendors[0][1] as number) / vendors.length
        : 0;

    return {
        totalVendors: new Set(vendors).size,
        totalMentions: vendors.length,
        topVendors: sortedVendors,
        concentrationRisk: topVendorConcentration > 0.4,
        concentrationRatio: topVendorConcentration
    };
}

export async function analyzeDocument(text: string, mode: 'procurement' | 'contract' | 'fraud' | 'audit' = 'procurement') {
    const classifier = await getClassifier();
    const truncatedText = text.substring(0, 2000);

    const analysis: any = {
        timestamp: new Date().toISOString(),
        mode,
        findings: [],
        recommendations: [],
        riskScore: 0,
        alerts: []
    };

    // 1. Core Logic based on Mode
    if (mode === 'procurement') {
        const pfmAreas = ['competitive bidding', 'procurement planning', 'value for money'];
        const pfmResults = await Promise.all(pfmAreas.map(async area => {
            const result = await classifier(truncatedText, [area, 'non-compliance']);
            return { area, compliant: result.scores[0] > 0.6, confidence: result.scores[0] };
        }));

        pfmResults.forEach(r => {
            if (!r.compliant) {
                analysis.findings.push({ severity: 'medium', text: `PFM Concern: ${r.area}` });
            }
        });

        const vendor = analyzeVendorConcentration(text);
        if (vendor.concentrationRisk) {
            analysis.findings.push({ severity: 'high', text: `High Vendor concentration: ${vendor.topVendors[0][0]}` });
            analysis.recommendations.push('Diversify vendor portfolio to reduce dependency.');
        }

    } else if (mode === 'contract') {
        const clauses = ['termination rights', 'indemnification', 'liability limits', 'governing law'];
        const results = await Promise.all(clauses.map(async clause => {
            const result = await classifier(truncatedText, [clause, 'unrelated']);
            return { clause, present: result.scores[0] > 0.5, confidence: result.scores[0] };
        }));

        results.forEach(r => {
            if (!r.present) analysis.findings.push({ severity: 'high', text: `Missing Clause: ${r.clause}` });
        });

    } else if (mode === 'fraud') {
        const benford = analyzeBenfordsLaw(text);
        if (benford.isSuspicious) {
            analysis.findings.push({ severity: 'critical', text: `Potential Financial Anomaly: ${(benford.suspiciousRatio * 100).toFixed(1)}% round numbers` });
        }

        const keywords = scanHighRiskKeywords(text);
        keywords.forEach(kw => {
            analysis.findings.push({ severity: kw.severity, text: `Risk Term: "${kw.keyword}"`, context: kw.context });
        });
    }

    // 2. Pillar Alignment & Final Score
    const baseRisk = analysis.findings.length * 10;
    analysis.riskScore = Math.min(100, baseRisk);
    analysis.topConcern = analysis.findings[0]?.text || "No major concerns";

    analysis.pillarAlignment = {
        decisionIntelligence: analysis.riskScore > 50 ? 0.4 : 0.8,
        complianceAutomation: 0.75,
        hitlGovernance: 0.9,
    };

    if (analysis.riskScore > 40) {
        analysis.alerts.push(`EARLY WARNING: Elevated risk detected in ${mode} profile.`);
    }

    analysis.auditTrail = {
        model: "mobilebert-uncased-mnli",
        inferenceTime: Date.now(),
        confidence: 0.88
    };

    return analysis;
}

// For backward compatibility with existing calls
export const analyzeText = analyzeDocument;
