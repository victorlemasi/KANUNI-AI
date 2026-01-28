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

      // If the module itself is a function/class, return it
      if (typeof mod === 'function') return mod;

      // Check for .default
      if (mod.default) {
        if (typeof mod.default === 'function') return mod.default;
        if (typeof mod.default === 'object' && funcName && typeof mod.default[funcName] === 'function') return mod.default[funcName];
      }

      // Specific known keys for common PDF/Word libraries
      if (typeof mod.PDFParse === 'function') return mod.PDFParse;
      if (typeof mod.PdfParse === 'function') return mod.PdfParse;

      // Look for the requested function name in the top level
      if (funcName && typeof mod[funcName] === 'function') return mod[funcName];

      return null;
    };

    const parsePDF = async (parser: any, dataBuffer: Buffer) => {
      try {
        // Try as a normal function call first (standard for pdf-parse)
        return await parser(dataBuffer);
      } catch (err: any) {
        // Fallback for class constructors in some production environments
        if (err.message && (err.message.includes("Class constructor") || err.message.includes("cannot be invoked without 'new'"))) {
          console.log("[SERVER] PDF Parser detected as class, instantiating with 'new'...");
          return await new parser(dataBuffer);
        }
        throw err;
      }
    };

    const pdfModule = require("pdf-parse");
    const mammothModule = require("mammoth");

    const pdfParser = getParser(pdfModule);
    const wordParser = getParser(mammothModule, 'extractRawText');

    if (!pdfParser && file.name.toLowerCase().endsWith(".pdf")) {
      console.error("[SERVER] PDF Parser Resolution Failed");
      return { success: false, error: "PDF initialization error: Analysis engine could not be initialized." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let text = "";

    // 1. Extract Text
    const DEPLOY_ID = "2026-01-28_B"; // For verifying the active version
    console.log(`[SERVER] [${DEPLOY_ID}] Milestone: Extracting text from ${file.name}...`);

    if (file.name.toLowerCase().endsWith(".pdf")) {
      try {
        const data = await parsePDF(pdfParser, buffer);

        // Diagnostic: What did we actually get back?
        const dataKeys = Object.keys(data || {});
        console.log(`[SERVER] PDF Parse Result Keys: [${dataKeys.join(', ')}]`);

        // --- TEXT SEARCH STRATEGY ---

        // 1. Standard locations
        if (data) {
          if (typeof data.text === 'string') text = data.text;
          else if (typeof data === 'string') text = data;
          else if (data.content && typeof data.content === 'string') text = data.content;
          else if (data.value && typeof data.value === 'string') text = data.value;
        }

        // 2. Recursive Search (For modern/unknown structures)
        if (!text || text.trim().length === 0) {
          console.log("[SERVER] Standard text properties empty. Starting recursive search...");

          const findText = (obj: any, depth = 0): string => {
            if (!obj || depth > 5) return "";
            if (typeof obj === 'string' && obj.length > 50) return obj;

            if (typeof obj === 'object') {
              for (const key in obj) {
                const found = findText(obj[key], depth + 1);
                if (found) return found;
              }
            }
            return "";
          };

          text = findText(data);
        }

        if (!text || text.trim().length === 0) {
          const typeInfo = data ? typeof data : 'null/undefined';
          const keysStr = dataKeys.join(', ');
          console.warn(`[SERVER] PDF parsed but resulting text is empty. Type: ${typeInfo}, Keys: [${keysStr}]`);

          return {
            success: false,
            error: `PDF parsed but no text was extracted. (Ver: ${DEPLOY_ID}, Type: ${typeInfo}, Keys: [${keysStr}])`
          };
        }

        console.log(`[SERVER] PDF parsing success. Extracted ${text.length} characters.`);

      } catch (pdfErr: any) {
        console.error("[SERVER] PDF Parse Error:", pdfErr);
        return { success: false, error: `Failed to parse PDF: ${pdfErr.message} (Ver: ${DEPLOY_ID})` };
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
