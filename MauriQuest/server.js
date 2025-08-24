// server.js — Express + Vite on ONE port (5173)
// Dev: Vite runs in middleware mode (HMR works). Prod: serve /dist.
// API routes are still under /api, /chat, /whereami, /health.

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";

// ⚠️ Dev only import (vite) is dynamic so production doesn't require it
let createViteServer = null;

dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT) || 5173;

// CORS not strictly needed now (same origin), but harmless:
app.use(cors());
app.use(express.json());

// --- ES module dirname setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Uploads ----------
const uploadsDir = path.resolve(__dirname, "./uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^\w.\-]/g, "_");
    cb(null, `${ts}__${safe}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

// ---------- Health ----------
app.get("/health", (_req, res) =>
  res.json({ ok: true, at: new Date().toISOString(), mode: isProd ? "prod" : "dev" })
);

// ---------- WhereAmI ----------
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const geocodeCache = new Map();
const cacheKey = (lat, lng, lang) => `${lat.toFixed(4)},${lng.toFixed(4)},${lang}`;
function bearingToCardinal(bearing) {
  if (bearing == null || isNaN(bearing)) return null;
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW","N"];
  return dirs[Math.round(((bearing % 360) / 22.5))];
}
function shortenAddress(addr = {}) {
  const {
    road, pedestrian, footway, cycleway, path, house_number,
    neighbourhood, suburb, city_district, village, town, city,
    municipality, county, state, postcode, country
  } = addr;
  const street = road || pedestrian || footway || cycleway || path;
  const locality = neighbourhood || suburb || city_district || city || town || village || municipality || county || state;
  const parts = [];
  if (street) parts.push(`${street}${house_number ? ` ${house_number}` : ""}`.trim());
  if (locality) parts.push(locality);
  if (postcode) parts.push(postcode);
  if (country) parts.push(country);
  return parts.filter(Boolean).join(", ");
}
function buildSpeech({ lat, lng, accuracy, heading, shortAddress }) {
  const latStr = lat.toFixed(5);
  const lngStr = lng.toFixed(5);
  const accStr = accuracy != null && !isNaN(accuracy) ? ` Accuracy about ${Math.round(accuracy)} meters.` : "";
  const head = bearingToCardinal(Number(heading));
  const headStr = head ? ` Heading ${head}.` : "";
  if (shortAddress) return `You are near ${shortAddress}.${accStr}${headStr}`.trim();
  return `Your coordinates are latitude ${latStr}, longitude ${lngStr}.${accStr}${headStr}`.trim();
}
app.get("/whereami", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!isFinite(lat) || !isFinite(lng)) {
      return res.status(400).json({ error: "Provide numeric lat and lng query params" });
    }
    const accuracy = req.query.accuracy != null ? Number(req.query.accuracy) : undefined;
    const heading = req.query.heading != null ? Number(req.query.heading) : undefined;
    const langRaw = String(req.query.lang || "en").toLowerCase();
    const lang = ["en", "fr"].includes(langRaw) ? langRaw : "en";

    const key = cacheKey(lat, lng, lang);
    if (geocodeCache.has(key)) {
      const cached = geocodeCache.get(key);
      const speech = buildSpeech({ lat, lng, accuracy, heading, shortAddress: cached.short });
      return res.json({ ...cached, coords: { lat, lng }, accuracy, heading, speech, cached: true });
    }

    const { data } = await axios.get(NOMINATIM_URL, {
      params: { format: "jsonv2", lat, lon: lng, addressdetails: 1 },
      headers: { "User-Agent": "voice-aid-whereami/1.0 (+http://localhost)", "Accept-Language": lang },
      timeout: 12000,
    });

    const display = data?.display_name || "";
    const short = shortenAddress(data?.address || {});
    const payload = { provider: "nominatim", display_name: display, short, address: data?.address || {} };
    geocodeCache.set(key, payload);

    const speech = buildSpeech({ lat, lng, accuracy, heading, shortAddress: short });
    res.json({ ...payload, coords: { lat, lng }, accuracy, heading, speech, cached: false });
  } catch (err) {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const fallbackSpeech = buildSpeech({
      lat, lng,
      accuracy: Number(req.query.accuracy),
      heading: Number(req.query.heading),
      shortAddress: "",
    });
    res.status(200).json({ provider: "fallback", coords: { lat, lng }, speech: fallbackSpeech });
  }
});

// ---------- ASL Demo ----------
app.post("/api/upload-asl", upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: "No video uploaded." });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    message: "Video uploaded.",
    file: { originalName: req.file.originalname, savedAs: req.file.filename, size: req.file.size, url: fileUrl },
  });
});
app.post("/api/demo-asl", (_req, res) => {
  const subtitles = ["Hello", "How are you?", "Hi", "What's up?", "You good?"];
  res.json({ success: true, message: "ASL video processed successfully.", subtitles, aiSpeech: subtitles.join(" ") });
});

// ---------- Gemini proxy ----------
const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY || "";
const GEMINI_URL = GEMINI_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`
  : null;
const SYSTEM_GUIDE = `You are a calm, supportive assistant for a distress-aid widget.`;

app.post("/chat", async (req, res) => {
  if (!GEMINI_URL) {
    return res.json({
      fallback: true,
      text: "I'm here to help. For immediate assistance, please contact local emergency services.",
    });
  }
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) return res.status(400).json({ error: "Messages array required" });

    const resp = await axios.post(
      GEMINI_URL,
      {
        contents: [
          { role: "user", parts: [{ text: SYSTEM_GUIDE }] },
          ...messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 150 },
      },
      { timeout: 20000 }
    );
    const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error("Empty response from Gemini");
    res.json({ text });
  } catch (err) {
    res.status(500).json({
      error: "Chat service temporarily unavailable",
      fallback: "I'm here to help. Please stay safe and reach out to someone you trust.",
    });
  }
});

// ---------- Frontend: dev vs prod ----------
async function start() {
  if (!isProd) {
    // DEV: use Vite in middleware mode on the SAME port (5173)
    ({ createServer: createViteServer } = await import("vite"));
    const vite = await createViteServer({
      server: { middlewareMode: true }, // attaches HMR + index.html handling
    });
    app.use(vite.middlewares); // let Vite handle /, assets, and SPA fallback
  } else {
    // PROD: serve static files from /dist
    const distDir = path.resolve(__dirname, "./dist");
    const indexHtml = path.join(distDir, "index.html");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => res.sendFile(indexHtml));
  }

  app.listen(PORT, () => {
    console.log(`✅ ONE server on http://localhost:${PORT} (${isProd ? "prod" : "dev"})`);
  });
}
start();
