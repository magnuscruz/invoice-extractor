import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
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

// API Routes
app.post("/api/extract", async (req, res) => {
  try {
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Missing image data" });
    }

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
            text: `Extract all relevant information from this Portuguese invoice (fatura). 
            Return the data in JSON format following this schema:
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
            The "atcud" is a special Portuguese tax code usually found near the QR code.
            If a field is not found, return null.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const extraction = JSON.parse(response.text || "{}");
    res.json(extraction);
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    res.status(500).json({ error: error.message || "Failed to extract information" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  const env = (process.env.NODE_ENV || "").trim();
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  
  // Decide if we should be in production mode
  const isProduction = env === "production" || (hasDist && env !== "development");
  
  console.log(`Server starting...`);
  console.log(`- NODE_ENV: [${process.env.NODE_ENV}]`);
  console.log(`- Detected Mode: ${isProduction ? "PRODUCTION" : "DEVELOPMENT"}`);
  console.log(`- Has Dist Folder: ${hasDist}`);
  
  if (!isProduction) {
    console.log("Mounting Vite middleware...");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static files from /dist...");
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
