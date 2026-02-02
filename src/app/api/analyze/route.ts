import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument } from "@/lib/analysis";

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
            if (!data) return "";
            if (depth > 12) {
                console.log(`[nuclearExtract] Depth limit reached at ${depth}`);
                return "";
            }

            // 1. Handle Promises explicitly first
            try {
                if (data instanceof Promise || (typeof data === 'object' && typeof data.then === 'function')) {
                    return nuclearExtract(await data, depth + 1);
                }
            } catch (e) {
                console.error(`[nuclearExtract] Promise failed:`, e);
                return "";
            }

            // 2. Direct Common Keys (pdf-parse / mammoth)
            if (typeof data.text === 'string' && data.text.length > 0) return data.text;
            if (typeof data.content === 'string' && data.content.length > 0) return data.content;

            // 3. Handle PDF.js Proxy Object (doc)
            // It often hides numPages in _pdfInfo or similar
            const doc = data.doc || data;

            // LOGGING PROBE
            if (depth < 3) {
                const keys = Object.keys(doc || {});
                console.log(`[nuclearExtract:${depth}] Inspecting object. Keys: [${keys.slice(0, 5).join(', ')}...]`);
                console.log(`[nuclearExtract:${depth}] .numPages: ${doc?.numPages}, ._pdfInfo: ${!!doc?._pdfInfo}`);
            }

            const numPages = doc.numPages || doc._pdfInfo?.numPages || (data.pdfInfo?.numPages) || 0;

            if (numPages > 0 && typeof doc.getPage === 'function') {
                console.log(`[API] Found PDF Proxy with ${numPages} pages`);
                let accumulated = "";
                for (let i = 1; i <= numPages; i++) {
                    try {
                        const page = await doc.getPage(i);
                        const content = await page.getTextContent();
                        const strings = content.items.map((it: any) => it.str).join(" ");
                        accumulated += strings + "\n";
                    } catch (err) {
                        console.warn(`[API] Failed page ${i} extraction:`, err);
                    }
                }
                if (accumulated.trim().length > 0) return accumulated;
            }

            // 4. Recursive Deep Search
            if (typeof data === 'object') {
                // Prioritize keys that look like they hold the document
                if (data.doc) return nuclearExtract(data.doc, depth + 1);

                let foundText = "";
                const props = Object.keys(data);
                for (const k of props) {
                    if (['options', 'parent', 'transport', '_capability', 'metadata'].includes(k)) continue;

                    const val = data[k];
                    if (val && typeof val === 'object') {
                        // Avoid infinite loops / circular refs
                        const res = await nuclearExtract(val, depth + 1);
                        if (res.length > foundText.length) foundText = res;
                    }
                }
                return foundText;
            }

            return "";
        };

        const parsePDF = async (buffer: Buffer): Promise<string> => {
            const pdfjsLib = require("pdfjs-dist");

            // Convert Buffer to Uint8Array for pdfjs-dist
            const uint8Array = new Uint8Array(buffer);
            const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
            const pdf = await loadingTask.promise;

            let fullText = "";
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(" ");
                fullText += pageText + "\n";
            }

            return fullText;
        };

        // Note: Using pdfjs-dist (pure JS) to avoid bundling issues with pdf-parse/pdf2json
        const mammothModule = require("mammoth");
        const wordParser = getParser(mammothModule, 'extractRawText');

        const bytes = await file.arrayBuffer();
        let buffer: Buffer | null = Buffer.from(bytes);
        console.log(`[API] POST: File ${file.name} converted to buffer. Bytes: ${bytes.byteLength}, Buffer Size: ${buffer.length}`);

        let text = "";
        let imageMetadata = null;

        const fileNameLower = file.name.toLowerCase();

        try {
            if (fileNameLower.endsWith(".pdf")) {
                text = await parsePDF(buffer);
                console.log(`[API] Extracted PDF Text Length: ${text.length}`);
            } else if (fileNameLower.endsWith(".docx")) {
                const result = await wordParser({ buffer });
                text = result.value;
            } else if (fileNameLower.match(/\.(xlsx|xls|csv)$/)) {
                // EXCEL / CSV PARSING
                const XLSX = require("xlsx");
                const workbook = XLSX.read(buffer, { type: 'buffer' });
                const sheetNames = workbook.SheetNames;

                text = `[SPREADSHEET ANALYSIS: ${file.name}]\n`;

                // Limit to first 3 sheets to avoid token overflow
                sheetNames.slice(0, 3).forEach((sheetName: string) => {
                    const sheet = workbook.Sheets[sheetName];
                    // Convert to CSV string for better LLM comprehension of structure
                    const csvContent = XLSX.utils.sheet_to_csv(sheet);
                    if (csvContent && csvContent.length > 0) {
                        text += `\n--- SHEET: ${sheetName} ---\n${csvContent.substring(0, 15000)}`; // Cap each sheet
                    }
                });
            } else if (fileNameLower.endsWith(".txt")) {
                // PLAIN TEXT PARSING
                text = new TextDecoder("utf-8").decode(buffer);
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
            if (global.gc) { try { global.gc(); } catch { } }
        }

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ success: false, error: "No readable content found" }, { status: 422 });
        }

        const analysis = await analyzeDocument(file, text, analysisType);

        const finalResult = {
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
                    analysisMode: (analysis as any).mode || analysisType,
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
