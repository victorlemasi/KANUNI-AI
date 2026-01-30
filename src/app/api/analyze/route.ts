import { NextRequest, NextResponse } from "next/server";
import { analyzeText } from "@/lib/analysis";

export const maxDuration = 60; // Definitive fix for 30s timeout (Phase 41)

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const analysisType = (formData.get("analysisType") as 'procurement' | 'contract' | 'fraud' | 'audit') || 'procurement';

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        console.log(`[API] [${analysisType}] Starting analysis for: ${file.name}`);

        // Aggressive interop helper (Duplicate for isolation)
        const getParser = (mod: any, funcName?: string) => {
            if (!mod) return null;
            if (typeof mod === 'function') return mod;
            if (mod.default) {
                if (typeof mod.default === 'function') return mod.default;
                if (typeof mod.default === 'object' && funcName && typeof mod.default[funcName] === 'function') return mod.default[funcName];
            }
            if (typeof mod.PDFParse === 'function') return mod.PDFParse;
            if (funcName && typeof mod[funcName] === 'function') return mod[funcName];
            return null;
        };

        const nuclearExtract = async (data: any, depth = 0): Promise<string> => {
            if (!data || depth > 12) return "";
            try {
                if (typeof data.then === 'function') return nuclearExtract(await data, depth + 1);
                const allKeys = Object.getOwnPropertyNames(data);
                const pKey = allKeys.find(k => k.includes('promise') || k.includes('_capability'));
                if (pKey && typeof data[pKey]?.then === 'function') return nuclearExtract(await data[pKey], depth + 1);
            } catch { }

            const proxy = data.doc || data;
            const numPages = proxy.numPages || proxy._pdfInfo?.numPages || (data.pdfInfo && data.pdfInfo.numPages) || 0;

            if (numPages > 0 && typeof proxy.getPage === 'function') {
                let text = "";
                for (let i = 1; i <= numPages; i++) {
                    try {
                        const page = await proxy.getPage(i);
                        const content = await page.getTextContent();
                        text += content.items.map((it: any) => it.str || "").join(" ") + "\n";
                    } catch { }
                }
                if (text.trim().length > 50) return text;
            }

            if (typeof data === 'string' && data.trim().length > 50) return data;
            const contentKeys = ['text', 'content', 'value', 'body', 'data'];
            for (const k of contentKeys) {
                if (data[k] && typeof data[k] === 'string' && data[k].length > 50) return data[k];
            }

            if (typeof data === 'object') {
                const props = Object.getOwnPropertyNames(data);
                for (const k of props) {
                    if (['options', 'parent', 'transport', '_capability'].includes(k)) continue;
                    const val = data[k];
                    if (val && typeof val === 'object') {
                        const found = await nuclearExtract(val, depth + 1);
                        if (found) return found;
                    }
                }
            }
            return "";
        };

        const parsePDF = async (pdfParser: any, buffer: Buffer) => {
            try {
                const result = await pdfParser(buffer);
                return result;
            } catch (err: any) {
                throw err;
            }
        };

        const pdfModule = require("pdf-parse");
        const mammothModule = require("mammoth");
        const pdfParser = getParser(pdfModule);
        const wordParser = getParser(mammothModule, 'extractRawText');

        const bytes = await file.arrayBuffer();
        let buffer: Buffer | null = Buffer.from(bytes);
        let text = "";
        let imageMetadata = null;

        const fileNameLower = file.name.toLowerCase();

        try {
            if (fileNameLower.endsWith(".pdf")) {
                const raw = await parsePDF(pdfParser, buffer);
                text = await nuclearExtract(raw);
            } else if (fileNameLower.endsWith(".docx")) {
                const result = await wordParser({ buffer });
                text = result.value;
            } else if (fileNameLower.match(/\.(png|jpg|jpeg|webp)$/)) {
                let sharp;
                try { sharp = require("sharp"); } catch { }
                if (sharp) {
                    const image = sharp(buffer);
                    imageMetadata = await image.metadata();
                    text = `Image Metadata Analysis: ${file.name}`;
                } else {
                    imageMetadata = { format: fileNameLower.split('.').pop() };
                    text = `Image Metadata (Simplified): ${file.name}`;
                }
            }
        } finally {
            // Aggressive Memory Cleanup: Release buffer immediately
            buffer = null;
            if (global.gc) { try { global.gc(); } catch (e) { } }
        }

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ success: false, error: "No readable content found" }, { status: 422 });
        }

        const analysis = await analyzeText(text, analysisType);

        const finalResult = {
            fileName: file.name,
            fileSize: file.size,
            timestamp: new Date().toISOString(),
            textPreview: text.substring(0, 500),
            imageMetadata,
            reportSummary: `KANUNI AI Report for ${file.name}. Risk Score: ${analysis.riskScore}%.`,
            ...analysis
        };

        // Persistence
        try {
            const prisma = (await import("@/lib/db")).default;
            await prisma.procurement.create({
                data: {
                    fileName: file.name,
                    fileSize: file.size,
                    riskScore: analysis.riskScore,
                    riskLevel: analysis.riskLevel,
                    topConcern: analysis.topConcern,
                    analysisMode: analysis.mode,
                    findings: JSON.stringify(analysis.findings),
                    suggestions: JSON.stringify(analysis.suggestions),
                    pillarAlignment: JSON.stringify(analysis.pillarAlignment),
                    textPreview: text.substring(0, 500)
                }
            });
        } catch (dbErr) {
            console.error("[API] DB Persistence failed (ignoring for continuity):", dbErr);
        }

        return NextResponse.json({ success: true, data: finalResult });

    } catch (error: any) {
        console.error("[API] Analysis error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
