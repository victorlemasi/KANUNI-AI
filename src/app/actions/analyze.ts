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
     * Aggressive recursive content extractor for PDF data structures.
     * Handles Promises, LoadingTasks, DocumentProxies, and standard result objects.
     */
    const resolveAndExtractText = async (data: any, depth = 0): Promise<string> => {
      if (!data || depth > 3) return "";

      // 1. Handle Promises/LoadingTasks
      if (typeof data.then === 'function') return resolveAndExtractText(await data, depth + 1);
      if (data.promise && typeof data.promise.then === 'function') return resolveAndExtractText(await data.promise, depth + 1);

      // 2. Direct string match
      if (typeof data === 'string' && data.length > 50) return data;

      // 3. Standard text property
      if (data.text && typeof data.text === 'string' && data.text.length > 50) return data.text;

      // 4. Check for nested Document/Proxy
      if (data.doc && data.doc !== data) {
        const found = await resolveAndExtractText(data.doc, depth + 1);
        if (found) return found;
      }

      // 5. Manual Page-by-Page Extraction (PDFDocumentProxy)
      const numPages = data.numPages || data._pdfInfo?.numPages || 0;
      if (numPages > 0 && typeof data.getPage === 'function') {
        console.log(`[SERVER] Detected PDF Proxy (${numPages} pages). Extracting manually...`);
        let fullText = "";
        for (let i = 1; i <= numPages; i++) {
          try {
            const page = await data.getPage(i);
            const content = await page.getTextContent();
            if (content?.items) {
              const pageText = content.items.map((item: any) => item.str || "").join(" ");
              fullText += pageText + "\n";
            }
          } catch (e) {
            console.warn(`[SERVER] Page ${i} extraction failed`, e);
          }
        }
        if (fullText.trim().length > 0) return fullText;
      }

      // 6. Deep Search Fallback (Look for any string > 100 chars in children)
      for (const key in data) {
        if (typeof data[key] === 'object' && data[key] !== null && key !== 'doc' && key !== 'options') {
          const found = await resolveAndExtractText(data[key], depth + 1);
          if (found) return found;
        } else if (typeof data[key] === 'string' && data[key].length > 100) {
          return data[key];
        }
      }

      return "";
    };

    const parsePDF = async (parser: any, dataBuffer: Buffer) => {
      try {
        console.log("[SERVER] Calling PDF parser...");
        // Handle both class/function and potential .pdf/.parse methods
        const callParser = typeof parser.parse === 'function' ? parser.parse :
          (typeof parser.pdf === 'function' ? parser.pdf : parser);

        try {
          return await callParser(dataBuffer);
        } catch (err: any) {
          if (err.message?.includes("Class constructor") || err.message?.includes("without 'new'")) {
            console.log("[SERVER] Instantiating parser with 'new'...");
            return new parser(dataBuffer);
          }
          throw err;
        }
      } catch (err: any) {
        console.error("[SERVER] PDF Invocation Error:", err);
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
    const DEPLOY_ID = "2026-01-28_E"; // Unified Recursive Extractor
    console.log(`[SERVER] [${DEPLOY_ID}] Starting content extraction from ${file.name}...`);

    const fileNameLower = file.name.toLowerCase();

    if (fileNameLower.endsWith(".pdf")) {
      try {
        const rawResult = await parsePDF(pdfParser, buffer);

        // Diagnostic: What did we actually get back?
        const dataKeys = Object.keys(rawResult || {});
        console.log(`[SERVER] PDF Parse Raw Result Keys: [${dataKeys.join(', ')}]`);

        // Run unified extraction engine
        text = await resolveAndExtractText(rawResult);

        if (!text || text.trim().length === 0) {
          return {
            success: false,
            error: `Could not extract text from PDF. (Ver: ${DEPLOY_ID}, Structure: [${dataKeys.join(', ')}])`
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
