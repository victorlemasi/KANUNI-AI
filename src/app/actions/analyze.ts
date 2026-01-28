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

    /**
     * Nuclear Extraction Engine: Recursively resolves and extracts text from ANY structure.
     */
    const nuclearExtract = async (data: any, depth = 0): Promise<string> => {
      if (!data || depth > 8) return "";

      // 1. Resolve Promises/Tasks
      try {
        if (typeof data.then === 'function') return nuclearExtract(await data, depth + 1);
        if (data.promise && typeof data.promise.then === 'function') return nuclearExtract(await data.promise, depth + 1);
        if (data.doc?.promise && typeof data.doc.promise.then === 'function') return nuclearExtract(await data.doc.promise, depth + 1);
        if (data._capability?.promise && typeof data._capability.promise.then === 'function') return nuclearExtract(await data._capability.promise, depth + 1);
      } catch (e) {
        console.warn(`[SERVER] Resolution error at depth ${depth}`, e);
      }

      // 2. Direct Content
      if (typeof data === 'string' && data.trim().length > 50) return data;
      if (data.text && typeof data.text === 'string' && data.text.trim().length > 50) return data.text;
      if (data.content && typeof data.content === 'string' && data.content.trim().length > 50) return data.content;

      // 3. Document Proxy (PDF.js standard)
      const numPages = data.numPages || data._pdfInfo?.numPages || 0;
      if (numPages > 0 && typeof data.getPage === 'function') {
        console.log(`[SERVER] Detected PDFProxy (${numPages} pages). Extracting manually...`);
        let text = "";
        for (let i = 1; i <= numPages; i++) {
          try {
            const page = await data.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((it: any) => it.str || "").join(" ") + "\n";
          } catch (e) { }
        }
        if (text.trim().length > 50) return text;
      }

      // 4. Brute Force Object Search
      if (typeof data === 'object') {
        // First check immediate children for text-like properties
        const textKeys = ['text', 'content', 'value', 'body', 'data'];
        for (const k of textKeys) {
          if (typeof data[k] === 'string' && data[k].length > 50) return data[k];
        }

        // Then recurse into children
        for (const k in data) {
          if (data[k] && typeof data[k] === 'object' && k !== 'options' && k !== 'parent') {
            const found = await nuclearExtract(data[k], depth + 1);
            if (found) return found;
          }
        }
      }

      return "";
    };

    const parsePDF = async (parser: any, dataBuffer: Buffer) => {
      try {
        console.log("[SERVER] Calling PDF parser...");
        const callTarget = parser.parse || parser.pdf || parser;
        let result;
        try {
          result = await callTarget(dataBuffer);
        } catch (err: any) {
          if (err.message?.includes("new")) {
            console.log("[SERVER] Using constructor-call...");
            result = new parser(dataBuffer);
          } else throw err;
        }
        return result;
      } catch (err: any) {
        console.error("[SERVER] PDF Invocation Failure", err);
        throw err;
      }
    };

    const pdfModule = require("pdf-parse");
    const mammothModule = require("mammoth");

    const pdfParser = getParser(pdfModule);
    const wordParser = getParser(mammothModule, 'extractRawText');

    if (!pdfParser && file.name.toLowerCase().endsWith(".pdf")) {
      return { success: false, error: "Analysis engine initialization failed." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let text = "";
    let imageMetadata = null;

    // 1. Extract Content
    const DEPLOY_ID = "2026-01-28_G"; // Nuclear Extraction + High Intelligence
    console.log(`[SERVER] [${DEPLOY_ID}] Processing ${file.name}...`);

    const fileNameLower = file.name.toLowerCase();

    if (fileNameLower.endsWith(".pdf")) {
      try {
        const raw = await parsePDF(pdfParser, buffer);
        text = await nuclearExtract(raw);

        if (!text || text.trim().length === 0) {
          const keys = Object.keys(raw || {}).join(', ');
          return { success: false, error: `Critical Extraction Failure. (Ver: ${DEPLOY_ID}, Structure: [${keys}])` };
        }
      } catch (e: any) {
        return { success: false, error: `Parser crash: ${e.message} (Ver: ${DEPLOY_ID})` };
      }
    } else if (fileNameLower.endsWith(".docx")) {
      if (!wordParser) return { success: false, error: "Word parser resolution failed." };
      const result = await wordParser.extractRawText({ buffer });
      text = result.value;
    } else if (fileNameLower.match(/\.(png|jpg|jpeg|webp)$/)) {
      // --- IMAGE ANALYSIS ---
      console.log(`[SERVER] Milestone: Processing image ${file.name} with sharp...`);
      try {
        const sharp = require("sharp");
        const image = sharp(buffer);
        imageMetadata = await image.metadata();

        // For now, since we don't have a local OCR engine active,
        // we'll analyze the file context if text extraction isn't possible.
        text = `Image Analysis: ${file.name}. \nFormat: ${imageMetadata.format}. \nDimensions: ${imageMetadata.width}x${imageMetadata.height}. \nSpace: ${imageMetadata.space}.`;

        console.log("[SERVER] Image metadata extracted successfully.");
      } catch (imgErr: any) {
        console.warn("[SERVER] Sharp image processing failed:", imgErr);
        return { success: false, error: `Image processing error: ${imgErr.message}` };
      }
    } else {
      return { success: false, error: "Unsupported format. Use PDF, DOCX, PNG, or JPG." };
    }

    if (!text || text.trim().length === 0) {
      return { success: false, error: "No readable content found in the document." };
    }

    console.log(`[SERVER] Content extracted (${text.length} chars). Starting AI analysis...`);

    // 2. Perform BERT Analysis
    const analysis = await analyzeText(text, analysisType);
    console.log("[SERVER] Milestone: AI Analysis complete successfully.");

    const finalResult = {
      fileName: file.name,
      fileSize: file.size,
      timestamp: new Date().toISOString(),
      textPreview: text.substring(0, 500),
      imageMetadata,
      reportSummary: `KANUNI AI ${imageMetadata ? 'Image' : 'Document'} Report for ${file.name}. Risk Level: ${analysis.riskScore}%. Primary Concern: ${analysis.topConcern}.`,
      ...analysis
    };

    console.log("[SERVER] Request finalized.");
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
