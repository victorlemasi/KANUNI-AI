/**
 * PPDA Act 2015 (Kenya) - Hardcoded Compliance Rules
 * 
 * This module contains rule-based checks for procurement compliance
 * based on the Public Procurement and Asset Disposal Act No. 33 of 2015
 */

export interface PPDAFinding {
    severity: 'critical' | 'high' | 'medium' | 'low';
    text: string;
    label: string;
    confidence: string;
    source: 'Rule-Based';
    section: string;
    recommendation: string;
}

// PPDA Act Section Definitions with Compliance Rules
interface PPDASection {
    number: string;
    title: string;
    keywords: string[];
    severity: 'critical' | 'high' | 'medium' | 'low';
    check: (text: string) => boolean;
    violation: string;
    recommendation: string;
}

const PPDA_SECTIONS: Record<string, PPDASection> = {
    // PART VI - GENERAL PROCUREMENT PRINCIPLES
    section53: {
        number: 'Section 53',
        title: 'Procurement and Asset Disposal Planning',
        keywords: ['procurement plan', 'annual plan', 'budget', 'planning'],
        severity: 'high',
        check: (text: string): boolean => {
            const hasProc = /procurement\s+plan/i.test(text);
            const hasBudget = /budget/i.test(text);
            return hasProc && hasBudget;
        },
        violation: 'Procurement planning documentation missing or incomplete',
        recommendation: 'Ensure annual procurement plan is prepared and approved before commencement of financial year as per Section 53(2)'
    },

    section54: {
        number: 'Section 54',
        title: 'Procurement Pricing and Requirement Not to Split Contracts',
        keywords: ['split', 'contract splitting', 'market price', 'inflated'],
        severity: 'high',
        check: (text: string): boolean => {
            // Check for suspicious contract splitting patterns
            const splitPattern = /split|divid(e|ing)\s+(contract|procurement)/i;
            return !splitPattern.test(text);
        },
        violation: 'Evidence of contract splitting to avoid procurement procedures',
        recommendation: 'Consolidate related procurements to comply with Section 54(1) prohibition on contract splitting'
    },

    section59: {
        number: 'Section 59',
        title: 'Limitation on Contracts with State and Public Officers',
        keywords: ['state officer', 'public officer', 'conflict', 'interest', 'disclosure'],
        severity: 'critical' as const,
        check: (text: string): boolean => {
            const hasOfficer = /(state|public)\s+officer/i.test(text);
            const hasDisclosure = /disclos(e|ure)/i.test(text);
            // If state/public officer mentioned, disclosure should be present
            return !hasOfficer || hasDisclosure;
        },
        violation: 'Potential conflict of interest - state/public officer involvement without disclosure',
        recommendation: 'Ensure compliance with Section 59: No contracts with state officers unless disclosed and approved'
    },

    section61: {
        number: 'Section 61',
        title: 'Tender Security',
        keywords: ['tender security', 'bid bond', 'guarantee', '2%', 'two percent'],
        severity: 'high',
        check: (text: string): boolean => {
            const hasSecurity = /tender\s+security|bid\s+bond/i.test(text);

            // Refined check: only look for percentages in the context of tender security
            // Look for a percentage within 100 characters of "tender security"
            const securityContext = text.match(/(?:tender\s+security|bid\s+bond)[\s\S]{0,100}(\d+(?:\.\d+)?)\s*%/i);

            if (hasSecurity && securityContext) {
                const percent = parseFloat(securityContext[1]);
                return percent <= 2;
            }
            return true; // No specific security percentage found in context
        },
        violation: 'Tender security exceeds 2% of tender value',
        recommendation: 'Reduce tender security to maximum 2% as per Section 61(2)(c)'
    },

    section66: {
        number: 'Section 66',
        title: 'Corrupt, Coercive, Obstructive, Collusive or Fraudulent Practice',
        keywords: ['corrupt', 'bribe', 'kickback', 'collusion', 'fraud', 'coercion'],
        severity: 'critical' as const,
        check: (text: string): boolean => {
            const corruptPattern = /corrupt|bribe|kickback|collusion|collude|fraud(ulent)?|coerci/i;
            const hasKeywords = corruptPattern.test(text);

            if (!hasKeywords) return true;

            // False positive prevention: Many docs have a "Corrupt and Fraudulent Practices" section definition.
            // We only flag if it's NOT in a standard legal definition context.
            // If it follows "definition", "prohibit", "shall not", it's likely a rule definition.
            const standardClausePattern = /(?:definition|prohibit|not\s+engage|policy\s+on|shall\s+not|article|clause)[\s\S]{0,50}(?:corrupt|fraud|collusion)/i;
            const isStandardClause = standardClausePattern.test(text);

            // If it's a standard clause, it's not a violation itself unless accompanied by specific red flags
            if (isStandardClause) {
                // Look for actual evidence like "found guilty", "investigated", "convicted"
                const evidencePattern = /found\s+guilty|investigat(ed|ion)|convict(ed|ion)|irregularit(y|ies)|overpriced/i;
                return !evidencePattern.test(text);
            }

            return false; // Flagged if keywords present and not clearly a standard clause
        },
        violation: 'Evidence of corrupt, collusive, or fraudulent practices',
        recommendation: 'Report to relevant authorities immediately. Section 66 prohibits all corrupt practices'
    },

    section78: {
        number: 'Section 78',
        title: 'Opening of Tenders',
        keywords: ['tender opening', 'opening committee', 'immediately', 'deadline', 'public'],
        severity: 'high',
        check: (text: string): boolean => {
            const hasOpening = /tender\s+opening|opening\s+(of\s+)?(tender|bid)/i.test(text);
            const hasImmediate = /immediate(ly)?|forthwith/i.test(text);
            const hasPublic = /public|attend(ance)?/i.test(text);

            if (hasOpening) {
                return hasImmediate || hasPublic;
            }
            return true;
        },
        violation: 'Tender opening procedures do not comply with transparency requirements',
        recommendation: 'Ensure tenders are opened immediately after deadline with public attendance allowed (Section 78)'
    },

    section80: {
        number: 'Section 80',
        title: 'Evaluation of Tenders',
        keywords: ['evaluation', 'criteria', 'objective', 'quantifiable', 'price', 'quality'],
        severity: 'high',
        check: (text: string): boolean => {
            const hasEval = /evaluat(ion|e)/i.test(text);
            const hasCriteria = /criteria|criterion/i.test(text);

            if (hasEval) {
                return hasCriteria;
            }
            return true;
        },
        violation: 'Evaluation criteria not clearly defined or disclosed',
        recommendation: 'Define objective and quantifiable evaluation criteria as per Section 80(3)'
    },

    section86: {
        number: 'Section 86',
        title: 'Successful Tender',
        keywords: ['lowest price', 'highest score', 'total cost', 'award'],
        severity: 'high',
        check: (text: string): boolean => {
            const hasAward = /award|successful/i.test(text);
            const hasValidCriteria = /(lowest\s+(evaluated\s+)?price|highest\s+(technical\s+)?score|lowest\s+total\s+cost)/i.test(text);

            if (hasAward) {
                return hasValidCriteria;
            }
            return true;
        },
        violation: 'Award criteria does not comply with Section 86 requirements',
        recommendation: 'Award must be based on: lowest evaluated price, highest score, or lowest total cost of ownership'
    },

    section91: {
        number: 'Section 91',
        title: 'Choice of Procurement Procedure',
        keywords: ['open tender', 'competitive', 'restricted', 'direct procurement'],
        severity: 'high',
        check: (text: string): boolean => {
            const hasRestricted = /restricted\s+tender/i.test(text);
            const hasDirect = /direct\s+procurement/i.test(text);
            const hasJustification = /justif(y|ication)|reason|emergency|urgent/i.test(text);

            // If restricted or direct procurement used, justification should be present
            if (hasRestricted || hasDirect) {
                return hasJustification;
            }
            return true;
        },
        violation: 'Alternative procurement method used without proper justification',
        recommendation: 'Open tendering is preferred. Justify use of alternative methods as per Section 91'
    },

    section93: {
        number: 'Section 93',
        title: 'Bid Rigging and Anti-Competitive Practices',
        keywords: ['bid rigging', 'cartel', 'price fixing', 'market sharing', 'anti-competitive'],
        severity: 'critical' as const,
        check: (text: string): boolean => {
            const rigPattern = /bid\s+rig|cartel|price\s+fix|market\s+shar(e|ing)|anti-competitive/i;
            return !rigPattern.test(text);
        },
        violation: 'Evidence of bid rigging or anti-competitive practices',
        recommendation: 'Section 93 prohibits bid rigging. Report to Competition Authority of Kenya immediately'
    },

    section135: {
        number: 'Section 135',
        title: 'Creation of Procurement Contracts',
        keywords: ['written contract', 'signed', 'contract document'],
        severity: 'high',
        check: (text: string): boolean => {
            const hasContract = /contract/i.test(text);
            const hasWritten = /written|sign(ed)?|document/i.test(text);

            if (hasContract) {
                return hasWritten;
            }
            return true;
        },
        violation: 'Contract not properly documented in writing',
        recommendation: 'All procurement contracts must be in writing and signed (Section 135)'
    },

    section142: {
        number: 'Section 142',
        title: 'Performance Security',
        keywords: ['performance security', 'performance bond', 'guarantee'],
        severity: 'medium',
        check: (_: string): boolean => {
            // Presence check only
            return true;
        },
        violation: 'Performance security requirements not clearly specified',
        recommendation: 'Specify performance security requirements as per Section 142'
    },

    section155: {
        number: 'Section 155',
        title: 'Preferences and Reservations',
        keywords: ['preference', 'reservation', 'women', 'youth', 'disability', '30%', 'thirty percent'],
        severity: 'medium',
        check: (text: string): boolean => {
            const hasPreference = /preference|reserv(e|ation)/i.test(text);
            const hasGroups = /(women|youth|disabilit)/i.test(text);
            const hasPercent = /30\s*%|thirty\s+percent/i.test(text);

            // Check if preferences are mentioned
            if (hasPreference) {
                return hasGroups || hasPercent;
            }
            return true;
        },
        violation: 'Preference and reservation schemes not properly implemented',
        recommendation: 'Reserve minimum 30% for women, youth, and persons with disabilities (Section 155)'
    }
};

// Price Analysis Rules
function analyzePricing(text: string): PPDAFinding[] {
    const findings: PPDAFinding[] = [];

    // Extract all monetary amounts
    const amounts = text.match(/(?:KES|Ksh|USD|\$|€|£)?\s*[\d,]+(?:\.\d{2})?/g) || [];
    const numericAmounts = amounts
        .map(amt => parseFloat(amt.replace(/[^0-9.]/g, '')))
        .filter(n => !isNaN(n) && n > 0);

    if (numericAmounts.length > 3) {
        // Check for suspiciously round numbers (potential price manipulation)
        const roundAmounts = numericAmounts.filter(n => n >= 1000 && n % 1000 === 0);
        const roundRatio = roundAmounts.length / numericAmounts.length;

        if (roundRatio > 0.6) {
            findings.push({
                severity: 'high',
                text: 'Excessive use of round numbers in pricing may indicate price manipulation',
                label: 'PRICING ANOMALY',
                confidence: '85%',
                source: 'Rule-Based',
                section: 'Section 54',
                recommendation: 'Review pricing structure for market competitiveness and authenticity'
            });
        }

        // Statistical outlier detection (Z-score > 2.5)
        const mean = numericAmounts.reduce((a, b) => a + b, 0) / numericAmounts.length;
        const stdDev = Math.sqrt(
            numericAmounts.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / numericAmounts.length
        );

        const outliers = numericAmounts.filter(n => {
            const zScore = stdDev === 0 ? 0 : Math.abs((n - mean) / stdDev);
            return zScore > 2.5;
        });

        if (outliers.length > 0) {
            findings.push({
                severity: 'medium',
                text: `Price outliers detected: ${outliers.length} amount(s) significantly deviate from average`,
                label: 'PRICE VARIANCE',
                confidence: '78%',
                source: 'Rule-Based',
                section: 'Section 54',
                recommendation: 'Investigate price outliers for potential inflation or errors'
            });
        }
    }

    return findings;
}

// Vendor Concentration Analysis
function analyzeVendorConcentration(text: string): PPDAFinding[] {
    const findings: PPDAFinding[] = [];

    // Look for patterns indicating single vendor dominance
    const singleSourcePatterns = [
        /single\s+source/i,
        /sole\s+supplier/i,
        /exclusive\s+supplier/i,
        /only\s+vendor/i
    ];

    for (const pattern of singleSourcePatterns) {
        if (pattern.test(text)) {
            findings.push({
                severity: 'high',
                text: 'Single source procurement detected without competitive bidding',
                label: 'VENDOR CONCENTRATION',
                confidence: '90%',
                source: 'Rule-Based',
                section: 'Section 91',
                recommendation: 'Justify single source procurement or conduct open competitive bidding'
            });
            break;
        }
    }

    return findings;
}

// Timeline and Deadline Analysis
function analyzeTimelines(text: string): PPDAFinding[] {
    const findings: PPDAFinding[] = [];

    // Check for unreasonably short tender periods
    const daysPattern = /(\d+)\s*days?/gi;
    const matches = text.matchAll(daysPattern);

    for (const match of matches) {
        const days = parseInt(match[1]);
        if (days < 7 && /tender|bid|submission/i.test(text.substring(Math.max(0, match.index! - 50), match.index! + 50))) {
            findings.push({
                severity: 'medium',
                text: `Tender period of ${days} days may be insufficient for competitive bidding`,
                label: 'TIMELINE CONCERN',
                confidence: '75%',
                source: 'Rule-Based',
                section: 'Section 97',
                recommendation: 'Ensure adequate time for tender preparation (minimum 14 days for domestic, 30 days for international)'
            });
        }
    }

    return findings;
}

// Main PPDA Compliance Check Function
export async function checkPPDACompliance(text: string, _mode: 'procurement' | 'contract' | 'fraud' | 'audit' = 'procurement'): Promise<any[]> {
    const findings: PPDAFinding[] = [];

    // Early exit for very small documents (likely not procurement docs)
    if (text.length < 200) {
        return findings;
    }

    // Limit text size to prevent memory issues (max 50KB)
    const limitedText = text.substring(0, 50000);

    // Run section checks (limit to first 5 violations to prevent memory bloat)
    let violationCount = 0;
    const maxViolations = 5;

    for (const section of Object.values(PPDA_SECTIONS)) {
        if (violationCount >= maxViolations) break;

        const isCompliant = section.check(limitedText);

        if (!isCompliant) {
            findings.push({
                severity: section.severity,
                text: section.violation,
                label: section.title.toUpperCase(),
                confidence: '95%',
                source: 'Rule-Based',
                section: section.number,
                recommendation: section.recommendation
            });
            violationCount++;
        }
    }

    // Run additional analysis only if document is procurement-related
    if (/procurement|tender|bid|contract/i.test(limitedText)) {
        const pricingFindings = analyzePricing(limitedText);
        const vendorFindings = analyzeVendorConcentration(limitedText);
        const timelineFindings = analyzeTimelines(limitedText);

        // Limit total findings to 10 to prevent memory issues
        findings.push(...pricingFindings.slice(0, 2));
        findings.push(...vendorFindings.slice(0, 2));
        findings.push(...timelineFindings.slice(0, 2));
    }

    return findings.slice(0, 10); // Hard limit to 10 findings
}

// Export section definitions for reference
export { PPDA_SECTIONS };
