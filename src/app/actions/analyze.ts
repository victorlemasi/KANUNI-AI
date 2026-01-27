"use server";

const pdfLib = require("pdf-parse");
const pdf = pdfLib.default || pdfLib;
const mammothLib = require("mammoth");
const mammoth = mammothLib.default || mammothLib;
import { analyzeText } from "@/lib/analysis";
import sharp from "sharp";

export async function processProcurementDocument(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file uploaded");
  }

  console.log(`Processing file: ${file.name} (${file.size} bytes)`);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  let text = "";

  // 1. Extract Text based on file type
  if (file.name.toLowerCase().endsWith(".pdf")) {
    console.log("Extracting text from PDF...");
    const data = await pdf(buffer);
    text = data.text;
  } else if (file.name.toLowerCase().endsWith(".docx")) {
    console.log("Extracting text from Word (.docx)...");
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new Error("Unsupported file format. Please upload PDF or Word (.docx)");
  }

  if (!text || text.trim().length === 0) {
    throw new Error("No readable text found in the document. Please ensure the file is not empty or image-only.");
  }

  console.log(`Text extracted (${text.length} characters). Starting AI analysis...`);

  // 2. Perform BERT Analysis
  const analysis = await analyzeText(text);

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
