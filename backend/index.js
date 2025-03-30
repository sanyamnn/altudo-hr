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
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str).join(" ");
    fullText += strings + "\\n";
  }

  return fullText;
}

async function initializeDocs() {
  const pdfPath = join(__dirname, "docs", "altudo_policies.pdf");
  const pdfText = await extractTextFromPDF(pdfPath);
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });
  const docs = await textSplitter.createDocuments([pdfText]);
  const embeddings = new OpenAIEmbeddings();
  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  console.log("✅ PDF embedded successfully!");
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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
"""

with open(os.path.join(backend_path, "index.js"), "w") as f:
    f.write(index_js)

# package.json using pdfjs-dist
package_json = """\
{
  "name": "altudo-hr-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "langchain": "^0.1.23",
    "openai": "^4.15.0",
    "pdfjs-dist": "^4.0.269"
  }
}
"""

with open(os.path.join(backend_path, "package.json"), "w") as f:
    f.write(package_json)

# Zip it up
zip_path = "/mnt/data/altudo-hr-chatbot-final.zip"
with ZipFile(zip_path, "w") as zipf:
    for folder, _, files in os.walk(project_root):
        for file in files:
            file_path = os.path.join(folder, file)
            arcname = os.path.relpath(file_path, project_root)
            zipf.write(file_path, arcname)

zip_path

Analyzed
python
Always show details

Copy
import os
import shutil
from zipfile import ZipFile

# Recreate directory structure after reset
project_root = "/mnt/data/altudo-hr-chatbot-final"
frontend_path = os.path.join(project_root, "frontend")
backend_path = os.path.join(project_root, "backend")
docs_path = os.path.join(backend_path, "docs")
os.makedirs(docs_path, exist_ok=True)

# Re-copy PDF
uploaded_pdf = "/mnt/data/ilovepdf_merged (1).pdf"
if not os.path.exists(uploaded_pdf):
    uploaded_pdf = "/mnt/data/ilovepdf_merged.pdf"  # fallback if renamed
shutil.copy(uploaded_pdf, os.path.join(docs_path, "altudo_policies.pdf"))

# Create final backend index.js using pdfjs-dist
index_js = """\
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
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str).join(" ");
    fullText += strings + "\\n";
  }

  return fullText;
}

async function initializeDocs() {
  const pdfPath = join(__dirname, "docs", "altudo_policies.pdf");
  const pdfText = await extractTextFromPDF(pdfPath);
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });
  const docs = await textSplitter.createDocuments([pdfText]);
  const embeddings = new OpenAIEmbeddings();
  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  console.log("✅ PDF embedded successfully!");
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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
