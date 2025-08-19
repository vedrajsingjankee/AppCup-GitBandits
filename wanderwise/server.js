// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- static hosting for your UI --- //
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- health check (optional) --- //
app.get("/health", (_req, res) => res.send("ok"));

// --- Gemini proxy --- //
const PORT = process.env.PORT || 5050;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in .env");
  process.exit(1);
}
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

const SYSTEM_GUIDE = `You are a calm, supportive assistant for a distress-aid widget.

Rules:
- Be concise, kind, nonjudgmental. Keep replies to 1–2 short sentences.
- Do NOT list or invent phone numbers. The UI shows helplines.
- Do NOT ask for the user's location. The UI handles that.
- If the user asks for helplines, reply like: "I'll show local helplines below."
- If they seem distressed, offer a short grounding/breathing step and reassurance.
- Avoid medical claims. Encourage contacting local emergency services if in danger.`;

async function geminiGenerate(userText) {
  const payload = {
    contents: [
      { role: "user", parts: [{ text: `${SYSTEM_GUIDE}\n\nUser: ${userText}` }] },
    ],
    generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
  };

  const { data } = await axios.post(GEMINI_URL, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
  });

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    "I'm here. Let's take a slow breath. I can also show local helplines—just ask."
  );
}

app.post("/chat", async (req, res) => {
  const text = (req.body?.text || "").trim();
  try {
    const reply = await geminiGenerate(text || "Offer a brief, supportive check-in.");
    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err?.response?.data || err.message);
    res.status(500).json({
      reply:
        "I'm here with you. Try a slow breath. If this is an emergency, call your local emergency number now.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Voice Aid server running on http://localhost:${PORT}`);
});
