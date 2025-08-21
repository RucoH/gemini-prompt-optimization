import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

// --- Statik dosyalar (index.html için) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public"))); // <- public/index.html otomatik servis edilir

// --- Model kurulumu (stabil SDK) ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // varsa 2.x de deneyebilirsin
  systemInstruction:
    "Türkçe ve öz yanıt ver. En fazla üç TAM cümle üret; her cümle sonu . ? ! ile bitsin. " +
    "Madde işareti, başlık veya liste kullanma."
});

const generationConfig = {
  responseMimeType: "application/json",
  responseSchema: {
    type: "object",
    properties: {
      sentences: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: { type: "string", description: "Tamamlanmış bir cümle" }
      }
    },
    required: ["sentences"]
  },
  maxOutputTokens: 200,
  temperature: 0.2
};

async function summarizeTo3(text) {
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text }] }],
    generationConfig
  });
  const jsonStr = result.response.text(); // JSON string beklenir
  try {
    const data = JSON.parse(jsonStr);
    const s = Array.isArray(data.sentences) ? data.sentences.slice(0, 3) : [];
    return s.join(" ");
  } catch (e) {
    console.error("JSON parse hatası:", e?.message, "\nGelen:", jsonStr);
    // Emniyet kemeri: ilk { ... } bloğunu dene
    const m = jsonStr.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        const data2 = JSON.parse(m[0]);
        const s2 = Array.isArray(data2.sentences) ? data2.sentences.slice(0, 3) : [];
        return s2.join(" ");
      } catch {}
    }
    // Son çare: metinden 3 cümleyi kes
    return jsonStr.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 3).join(" ") || "Özet üretilemedi.";
  }
}

// --- Sağlık ---
app.get("/health", (req, res) => {
  res.json({ ok: true, hasKey: !!process.env.GEMINI_API_KEY });
});

// --- API ---
app.post("/api/summary", async (req, res) => {
  try {
    const { text } = req.body ?? {};
    if (!text || !text.trim()) return res.status(400).json({ error: "text gerekli" });
    const summary = await summarizeTo3(text);
    res.json({ summary });
  } catch (err) {
    console.error("Gemini HATA:", err?.name, err?.message);
    res.status(500).json({ summary: "Özet üretilemedi." });
  }
});

// (İsteğe bağlı) Kök URL'e gelen istekleri index.html'e düşür
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log("Server hazır:", PORT));
