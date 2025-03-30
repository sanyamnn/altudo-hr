import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as pdfjsLib from "pdfjs-dist";
import { OpenAI } from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { loadQAStuffChain } from "langchain/chains";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let vectorStore;

async function extractTextFromPDF(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({
    data,
    standardFontDataUrl: "https://unpkg.com/pdfjs-dist@2.16.105/legacy/build/standard_fonts/",
  }).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str).join(" ");
    fullText += strings + "\n";
  }

  return fullText;
}

async function initializeDocs() {
  try {
    const pdfPath = join(__dirname, "docs", "altudo_policies.pdf");
    const pdfText = await extractTextFromPDF(pdfPath);
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 150,
    });
    const docs = await textSplitter.createDocuments([pdfText]);
    const embeddings = new OpenAIEmbeddings();
    vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    console.log("✅ HR policies embedded and ready!");
  } catch (error) {
    console.error("❌ Failed to initialize docs:", error.message);
  }
}

app.post("/api/hr-chat", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Missing question" });

  if (!vectorStore) {
    return res.status(500).json({ error: "PDF not initialized. Please check backend logs." });
  }

  try {
    const relevantDocs = await vectorStore.similaritySearch(question, 4);
    const chain = loadQAStuffChain({ llm: openai });
    const response = await chain.call({ input_documents: relevantDocs, question });
    res.json({ answer: response.text });
  } catch (error) {
    console.error("❌ Error processing question:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  await initializeDocs();
  console.log(`🚀 HR Chatbot backend running on http://localhost:${PORT}`);
});
