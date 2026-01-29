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
     * Forensic Extraction Engine (Ver O): Exhaustive property scanning + structural bypass.
     */
    const nuclearExtract = async (data: any, depth = 0): Promise<string> => {
      if (!data || depth > 12) return "";

      // 1. Resolve Promises/Tasks (O-Specific: Invasively find thenables)
      try {
        if (typeof data.then === 'function') {
          console.log(`[SERVER] Thenable detected at depth ${depth}. Awaiting...`);
          return nuclearExtract(await data, depth + 1);
        }

        // PDF.js LoadingTask specific resolution (Invasive search)
        const allKeys = Object.getOwnPropertyNames(data);
        const pKey = allKeys.find(k => k.includes('promise') || k.includes('_capability'));
        if (pKey && typeof data[pKey]?.then === 'function') {
          console.log(`[SERVER] Hidden promise '${pKey}' found at depth ${depth}. Awaiting...`);
          return nuclearExtract(await data[pKey], depth + 1);
        }
      } catch (e) {
        console.warn(`[SERVER] Resolution error at depth ${depth}`, e);
      }

      // 2. Document Proxy (PDF.js standard)
      const proxy = data.doc || data;
      const numPages = proxy.numPages || proxy._pdfInfo?.numPages || (data.pdfInfo && data.pdfInfo.numPages) || 0;

      if (numPages > 0 && typeof proxy.getPage === 'function') {
        console.log(`[SERVER] Detected PDFProxy (${numPages} pages). Extracting manually...`);
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

      // 3. Direct Content
      if (typeof data === 'string' && data.trim().length > 50) return data;
      const contentKeys = ['text', 'content', 'value', 'body', 'data'];
      for (const k of contentKeys) {
        if (data[k] && typeof data[k] === 'string' && data[k].length > 50) return data[k];
      }

      // 4. Brute Force Object Search (Invasive Scan)
      if (typeof data === 'object') {
        const props = Object.getOwnPropertyNames(data);
        for (const k of props) {
          // Bypass known recursive or useless keys
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

    const parsePDF = async (parser: any, dataBuffer: Buffer) => {
      try {
        console.log("[SERVER] Calling PDF parser...");
        const callTarget = parser.parse || parser.pdf || parser;
        let result;
        try {
          // Standard call
          result = await callTarget(dataBuffer);
        } catch (err: any) {
          if (err.message?.includes("new")) {
            console.log("[SERVER] Using constructor-call...");
            result = new parser(dataBuffer);
          } else throw err;
        }

        // Ver O: If we get the [options, doc, progress] but it's not resolved
        if (result && typeof result === 'object' && result.options && result.progress && !result.doc) {
          console.log("[SERVER] Forensic Match: Detected unresolved Loading Task. Attempting root resolve...");
          if (typeof result.then === 'function') return await result;
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
    const DEPLOY_ID = "2026-01-28_R"; // Dual-AI Intelligence (Llama-1B + BERT)
    console.log(`[SERVER] [${DEPLOY_ID}] Processing ${file.name}...`);

    const fileNameLower = file.name.toLowerCase();

    if (fileNameLower.endsWith(".pdf")) {
      try {
        const raw = await parsePDF(pdfParser, buffer);
        text = await nuclearExtract(raw);

        if (!text || text.trim().length === 0) {
          // --- LEVEL 3 DIAGNOSTIC (Ver O) ---
          const report: any = {
            keys: Object.getOwnPropertyNames(raw || {}),
            docKeys: raw?.doc ? Object.getOwnPropertyNames(raw.doc) : 'N/A',
            docType: typeof raw?.doc,
            hasPromise: !!(raw?.promise || raw?.doc?.promise),
            hasGetPage: !!(raw?.getPage || raw?.doc?.getPage)
          };

          return {
            success: false,
            error: `Critical Extraction Failure. (Ver: ${DEPLOY_ID}, L3: ${JSON.stringify(report)})`
          };
        }
      } catch (e: any) {
        return { success: false, error: `Parser crash: ${e.message} (Ver: ${DEPLOY_ID})` };
      }
    } else if (fileNameLower.endsWith(".docx")) {
      if (!wordParser) return { success: false, error: "Word parser resolution failed." };
      const result = await wordParser({ buffer });
      text = result.value;
    } else if (fileNameLower.match(/\.(png|jpg|jpeg|webp)$/)) {
      // --- IMAGE ANALYSIS ---
      try {
        // We use a guarded require to prevent module-level crashes if native binaries are absent
        let sharp;
        try {
          sharp = require("sharp");
        } catch {
          console.warn("[SERVER] Sharp native module not available. Falling back to metadata-lite.");
        }

        if (sharp) {
          const image = sharp(buffer);
          imageMetadata = await image.metadata();
          text = `Image Analysis: ${file.name}. \nFormat: ${imageMetadata.format}. \nDimensions: ${imageMetadata.width}x${imageMetadata.height}. \nSpace: ${imageMetadata.space}.`;
          console.log("[SERVER] Image metadata extracted successfully.");
        } else {
          imageMetadata = { format: fileNameLower.split('.').pop(), width: 0, height: 0, space: 'unknown' };
          text = `Image Metadata (Simplified): ${file.name}. \n(Note: Native processing disabled for this environment).`;
        }
      } catch (imgErr: any) {
        console.warn("[SERVER] Shielded image processing failure:", imgErr);
        text = `Image Context: ${file.name} (Metadata acquisition failed)`;
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
      reportSummary: `KANUNI AI ${imageMetadata ? 'Image' : 'Document'} Report for ${file.name}. Risk Level: ${analysis.riskLevel} (${analysis.riskScore}%). Primary Concern: ${analysis.topConcern}.`,
      ...analysis
    };

    // 3. PERSISTENCE (Phase 16)
    try {
      console.log("[SERVER] Persisting results to database...");
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
          textPreview: text.substring(0, 500),
          alerts: {
            create: (analysis.alerts || []).map((msg: string) => ({
              type: 'ANOMALY',
              severity: analysis.riskLevel,
              message: msg
            }))
          },
          auditTrails: {
            create: {
              action: 'ANALYSIS',
              details: `Document ${file.name} analyzed in ${analysisType} mode.`
            }
          }
        }
      });
      console.log("[SERVER] Persistence complete.");
    } catch (dbErr: any) {
      console.error("[SERVER] Database persistence failed:", dbErr);
      // We don't fail the request if persistence fails, just log it.
    }

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
