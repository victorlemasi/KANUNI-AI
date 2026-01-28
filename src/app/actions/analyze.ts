"use server";

import { analyzeText } from "@/lib/analysis";

export async function processProcurementDocument(formData: FormData) {
  const file = formData.get("file") as File;
  const analysisType = (formData.get("analysisType") as 'procurement' | 'contract' | 'fraud' | 'audit') || 'procurement';

  if (!file) {
    console.error("[SERVER] No file provided in formData");
    return { success: false, error: "No file uploaded" };
  }

  try {
    console.log(`[SERVER] [${analysisType}] Starting analysis for: ${file.name} (${file.size} bytes)`);

    // Aggressive interop helper
    const getParser = (mod: any, funcName?: string) => {
      if (!mod) return null;
      if (typeof mod === 'function') return mod;
      if (mod.default && typeof mod.default === 'function') return mod.default;
      if (funcName && typeof mod[funcName] === 'function') return mod[funcName];
      if (funcName && mod.default && typeof mod.default[funcName] === 'function') return mod.default[funcName];
      return null;
    };

    const pdfModule = require("pdf-parse");
    const mammothModule = require("mammoth");

    const pdfParser = getParser(pdfModule);
    const wordParser = getParser(mammothModule, 'extractRawText');

    const pdfKeys = Object.keys(pdfModule || {});
    const mammothKeys = Object.keys(mammothModule || {});

    console.log(`[SERVER] Debug: pdf-parse keys: ${pdfKeys}`);
    console.log(`[SERVER] Debug: mammoth keys: ${mammothKeys}`);

    if (!pdfParser && file.name.toLowerCase().endsWith(".pdf")) {
      const structureInfo = `Type: ${typeof pdfModule}, Keys: [${pdfKeys.join(', ')}]`;
      console.error("[SERVER] PDF Parser Resolution Failed. Structure:", structureInfo);
      return { success: false, error: `PDF initialization error: Parser function not resolved. (${structureInfo})` };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let text = "";

    // 1. Extract Text
    console.log(`[SERVER] Milestone: Extracting text from ${file.name}...`);
    if (file.name.toLowerCase().endsWith(".pdf")) {
      try {
        // pdf-parse expects a buffer and returns a promise
        const data = await pdfParser(buffer);
        text = data.text;
      } catch (pdfErr: any) {
        console.error("[SERVER] PDF Parse Error:", pdfErr);
        return { success: false, error: `Failed to parse PDF: ${pdfErr.message}` };
      }
    } else if (file.name.toLowerCase().endsWith(".docx")) {
      if (!wordParser || typeof wordParser.extractRawText !== 'function') {
        return { success: false, error: "Word parser resolution failed." };
      }
      const result = await wordParser.extractRawText({ buffer });
      text = result.value;
    } else {
      console.warn(`[SERVER] Unsupported file format: ${file.name}`);
      return { success: false, error: "Unsupported file format. Please upload PDF or Word (.docx)" };
    }

    if (!text || text.trim().length === 0) {
      console.warn("[SERVER] No text extracted from document");
      return { success: false, error: "No readable text found in the document. Please ensure it is not an image-only scan." };
    }

    console.log(`[SERVER] Milestone: Text extracted (${text.length} characters). Starting BERT classification...`);

    // 2. Perform BERT Analysis
    const analysis = await analyzeText(text, analysisType);
    console.log("[SERVER] Milestone: AI Analysis complete successfully.");

    // 3. Optional: Sharp processing foundation
    try {
      const sharp = require("sharp");
      if (sharp) {
        await sharp(Buffer.from([0, 0, 0, 0])).metadata().catch(() => null);
      }
    } catch (e) {
      // Silently fail optional step
    }

    const finalResult = {
      fileName: file.name,
      fileSize: file.size,
      timestamp: new Date().toISOString(),
      textPreview: text.substring(0, 500),
      reportSummary: `KANUNI AI Governance Report for ${file.name}. Risk Level: ${analysis.riskScore}%. Primary Concern: ${analysis.topConcern}.`,
      ...analysis
    };

    console.log("[SERVER] Request finalized and returning to client.");
    return { success: true, data: finalResult };

  } catch (error: any) {
    console.error("[SERVER] CRITICAL CRASH during analysis:");
    console.error(error);

    let errorMessage = "Internal Analysis Error";
    if (error.message?.includes("memory")) errorMessage = "Server Out of Memory (OOM) during AI classification";
    else if (error.message?.includes("time")) errorMessage = "AI Inference timed out";
    else errorMessage = error.message || "An unknown error occurred on the server";

    return { success: false, error: errorMessage };
  }
}
