
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { loadQAStuffChain } from "langchain/chains";
import fs from "fs";
import pdf from "pdf-parse";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let vectorStore;

async function initializeDocs() {
  const dataBuffer = fs.readFileSync("./docs/altudo_policies.pdf");
  const pdfData = await pdf(dataBuffer);
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });
  const docs = await textSplitter.createDocuments([pdfData.text]);
  const embeddings = new OpenAIEmbeddings();
  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  console.log("✅ Embedded HR policies and initialized vector store");
}

app.post("/api/hr-chat", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Missing question" });

  const relevantDocs = await vectorStore.similaritySearch(question, 4);
  const chain = loadQAStuffChain({ llm: openai });
  const response = await chain.call({ input_documents: relevantDocs, question });

  res.json({ answer: response.text });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  await initializeDocs();
  console.log(`🚀 HR Chatbot backend running on http://localhost:${PORT}`);
});
