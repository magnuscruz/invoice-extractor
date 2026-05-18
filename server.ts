import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Increase limit for base64 images
app.use(express.json({ limit: '20mb' }));

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Initialize DeepSeek (if key available)
const deepseek = process.env.DEEPSEEK_API_KEY ? new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
}) : null;

// Extraction Prompt & Schema
const EXTRACTION_SCHEMA = `
{
  "merchant": { "name": string, "nif": string, "address": string },
  "invoice": { "number": string, "date": string, "type": string },
  "customer": { "name": string, "nif": string },
  "items": [ { "description": string, "quantity": number, "unit_price": number, "total": number, "vat_rate": number } ],
  "totals": { "net_amount": number, "vat_amount": number, "gross_total": number },
  "currency": string,
  "atcud": string,
  "qr_code_link": string
}
`;

const SYSTEM_PROMPT = `Extract all relevant information from this Portuguese invoice (fatura). 
Return the data in JSON format following this schema:
${EXTRACTION_SCHEMA}
The "atcud" is a special Portuguese tax code usually found near the QR code.
If a field is not found, return null. Ensure numbers are numbers and not strings.`;

// API Routes
app.post("/api/extract", async (req, res) => {
  try {
    const { image, mimeType, provider = "gemini" } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Missing image data" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    if (provider === "deepseek") {
      if (!deepseek) {
        return res.status(500).json({ error: "DeepSeek API key is not configured on the server." });
      }

      // Step 1: Use Gemini for high-quality OCR
      const ocrResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: { mimeType: mimeType || "image/jpeg", data: image },
            },
            { text: "Read and list all text found in this Portuguese invoice, being very detailed and maintaining the hierarchy of symbols/text." },
          ],
        },
      });

      const rawText = ocrResponse.text || "";

      // Step 2: Use DeepSeek for structured extraction
      const dsResponse = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Here is the raw text from the invoice:\n\n${rawText}` },
        ],
        response_format: { type: "json_object" },
      });

      const extraction = JSON.parse(dsResponse.choices[0]?.message?.content || "{}");
      return res.json(extraction);
    } else {
      // Default: Gemini
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: image,
              },
            },
            {
              text: SYSTEM_PROMPT,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
        },
      });

      const extraction = JSON.parse(response.text || "{}");
      res.json(extraction);
    }
  } catch (error: any) {
    console.error(`${provider.toUpperCase()} Extraction Error:`, error);
    res.status(500).json({ error: error.message || "Failed to extract information" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  const env = (process.env.NODE_ENV || "").trim().toLowerCase();
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  
  // Robust production detection
  // 1. Explicitly set to production
  // 2. OR we have a dist folder and are NOT explicitly in development
  const isProduction = env === "production" || (hasDist && env !== "development");
  
  console.log("-----------------------------------------");
  console.log(`Server starting at ${new Date().toISOString()}`);
  console.log(`- NODE_ENV: [${process.env.NODE_ENV}]`);
  console.log(`- Detected Mode: ${isProduction ? "PRODUCTION" : "DEVELOPMENT"}`);
  console.log(`- Base Directory: ${process.cwd()}`);
  console.log(`- Dist Folder Exists: ${hasDist}`);
  
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.warn("⚠️  WARNING: GEMINI_API_KEY is not set! Extraction will fail.");
  } else {
    console.log(`- GEMINI_API_KEY: Configured (Length: ${apiKey.length}, starts with: ${apiKey.substring(0, 4)}...)`);
  }
  
  console.log("-----------------------------------------");
  
  if (!isProduction) {
    console.log("Mode: DEVELOPMENT (Mounting Vite middleware)");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Mode: PRODUCTION (Serving static files)");
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      // Fallback for SPA
      if (req.path.startsWith('/api')) return res.status(404).json({ error: "API route not found" });
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
