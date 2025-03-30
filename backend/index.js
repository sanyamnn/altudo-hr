import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import pdf from "pdf-parse";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { OpenAI } from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { loadQAStuffChain } from "langchain/chains";

// Setup path helpers for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup server and OpenAI
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let vectorStore;

// Embed and store HR policy document
async function initializeDocs() {
  const pdfPath = join(__dirname, "docs", "altudo_policies.pdf");
  const dataBuffer = fs.readFileSync(pdfPath);
  const pdfData = await pdf(dataBuffer);

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });
  const docs = await textSplitter.createDocuments([pdfData.text]);
  const embeddings = new OpenAIEmbeddings();
  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  console.log("✅ HR policies embedded and ready to chat!");
}

// Endpoint for chatbot
app.post("/api/hr-chat", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Missing question" });

  const relevantDocs = await vectorStore.similaritySearch(question, 4);
  const chain = loadQAStuffChain({ llm: openai });
  const response = await chain.call({ input_documents: relevantDocs, question });

  res.json({ answer: response.text });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  await initializeDocs();
  console.log(`🚀 HR Chatbot backend is live on http://localhost:${PORT}`);
});
