"use server";

const pdf = require("pdf-parse");
const mammoth = require("mammoth");
import { analyzeText } from "@/lib/analysis";
import sharp from "sharp";

export async function processProcurementDocument(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file uploaded");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  let text = "";

  // 1. Extract Text based on file type
  if (file.name.toLowerCase().endsWith(".pdf")) {
    const data = await pdf(buffer);
    text = data.text;
  } else if (file.name.toLowerCase().endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new Error("Unsupported file format. Please upload PDF or Word (.docx)");
  }

  // 2. Perform BERT Analysis
  const analysis = await analyzeText(text);

  // 3. Optional: Sharp processing foundation
  try {
    const metadata = await sharp(Buffer.from([0, 0, 0, 0])).metadata();
  } catch (e) {}

  return {
    fileName: file.name,
    fileSize: file.size,
    timestamp: new Date().toISOString(),
    textPreview: text.substring(0, 500),
    reportSummary: `KANUNI AI Governance Report for ${file.name}. Risk Level: ${analysis.riskScore}%. Primary Concern: ${analysis.topConcern}.`,
    ...analysis
  };
}
