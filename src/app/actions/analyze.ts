"use server";

import { analyzeText } from "@/lib/analysis";
import sharp from "sharp";

export async function processProcurementDocument(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file uploaded");
  }

  // Dynamic require to prevent top-level bundling issues in Next.js
  const pdf = require("pdf-parse");
  const mammoth = require("mammoth");

  const pdfParser = typeof pdf === 'function' ? pdf : pdf.default || pdf;
  const wordParser = typeof mammoth === 'function' ? mammoth : mammoth.default || mammoth;

  console.log(`Processing file: ${file.name} (${file.size} bytes)`);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  let text = "";

  // 1. Extract Text based on file type
  if (file.name.toLowerCase().endsWith(".pdf")) {
    console.log("Extracting text from PDF...");
    const data = await pdfParser(buffer);
    text = data.text;
  } else if (file.name.toLowerCase().endsWith(".docx")) {
    console.log("Extracting text from Word (.docx)...");
    const result = await wordParser.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new Error("Unsupported file format. Please upload PDF or Word (.docx)");
  }

  if (!text || text.trim().length === 0) {
    throw new Error("No readable text found in the document. Please ensure the file is not empty or image-only.");
  }

  console.log(`Text extracted (${text.length} characters). Starting AI analysis...`);

  // 2. Perform BERT Analysis
  const analysisType = (formData.get("analysisType") as 'procurement' | 'contract') || 'procurement';
  console.log(`Running AI Analysis [Mode: ${analysisType}]...`);
  const analysis = await analyzeText(text, analysisType);

  console.log("AI analysis complete.");

  // 3. Optional: Sharp processing foundation
  try {
    const metadata = await sharp(Buffer.from([0, 0, 0, 0])).metadata();
  } catch (e) { }

  return {
    fileName: file.name,
    fileSize: file.size,
    timestamp: new Date().toISOString(),
    textPreview: text.substring(0, 500),
    reportSummary: `KANUNI AI Governance Report for ${file.name}. Risk Level: ${analysis.riskScore}%. Primary Concern: ${analysis.topConcern}.`,
    ...analysis
  };
}
