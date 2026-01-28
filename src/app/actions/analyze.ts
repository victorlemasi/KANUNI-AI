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
     * Fallback for when the parser returns a PDFDocumentProxy (common on Render)
     */
    const extractFromDocProxy = async (doc: any): Promise<string> => {
      if (!doc) return "";

      // Attempt to find page count in various standard locations
      const numPages = doc.numPages || doc._pdfInfo?.numPages || 0;

      console.log(`[SERVER] Extracting from Document Proxy. Pages detected: ${numPages}. Keys: [${Object.keys(doc).join(', ')}]`);

      if (numPages === 0) return "";

      let fullText = "";
      for (let i = 1; i <= numPages; i++) {
        try {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          if (content && content.items) {
            const pageText = content.items.map((item: any) => item.str || "").join(" ");
            fullText += pageText + "\n";
          }
        } catch (pageErr) {
          console.warn(`[SERVER] Failed to extract from page ${i}`, pageErr);
        }
      }
      return fullText;
    };

    const parsePDF = async (parser: any, dataBuffer: Buffer) => {
      try {
        console.log("[SERVER] Calling PDF parser...");
        let result = await parser(dataBuffer);

        // Handle PDFLoadingTask pattern (common in some pdf-parse forks)
        if (result && result.promise && typeof result.promise.then === 'function') {
          console.log("[SERVER] PDFLoadingTask detected, awaiting promise...");
          result = await result.promise;
        }

        return result;
      } catch (err: any) {
        // Fallback for class constructors
        if (err.message && (err.message.includes("Class constructor") || err.message.includes("cannot be invoked without 'new'"))) {
          console.log("[SERVER] PDF Parser detected as class, instantiating with 'new'...");
          let result = await new parser(dataBuffer);

          if (result && result.promise && typeof result.promise.then === 'function') {
            console.log("[SERVER] PDFLoadingTask (from class) detected, awaiting promise...");
            result = await result.promise;
          }
          return result;
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
    let imageMetadata = null;

    // 1. Extract Content
    const DEPLOY_ID = "2026-01-28_D"; // Robust Proxy Extraction
    console.log(`[SERVER] [${DEPLOY_ID}] Starting content extraction from ${file.name}...`);

    const fileNameLower = file.name.toLowerCase();

    if (fileNameLower.endsWith(".pdf")) {
      try {
        const data = await parsePDF(pdfParser, buffer);

        // Diagnostic: What did we actually get back?
        const dataKeys = Object.keys(data || {});
        console.log(`[SERVER] PDF Parse Result Keys: [${dataKeys.join(', ')}]`);

        // --- TEXT EXTRACTION STRATEGY ---

        // 1. Check for PDFDocumentProxy handle (common on Render bundle variants)
        if (data && (data.doc || data.numPages || data._pdfInfo)) {
          console.log("[SERVER] Document Proxy detected. Using manual extraction fallback.");
          text = await extractFromDocProxy(data.doc || data);
        }
        // 2. Standard location
        else if (data && typeof data.text === 'string') {
          text = data.text;
        }
        // 3. Fallback search
        else if (data) {
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
          const keys = Object.keys(data || {});
          return {
            success: false,
            error: `Could not extract text from PDF. (Ver: ${DEPLOY_ID}, Keys: [${keys.join(', ')}])`
          };
        }

      } catch (pdfErr: any) {
        console.error("[SERVER] PDF Parse Error:", pdfErr);
        return { success: false, error: `Failed to parse PDF: ${pdfErr.message} (Ver: ${DEPLOY_ID})` };
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
