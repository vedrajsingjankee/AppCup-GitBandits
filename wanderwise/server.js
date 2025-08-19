// server.js — WhereAmI + Gemini (ESM)
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
const _dirname = path.dirname(__filename);
app.use(express.static(path.join(_dirname, "public")));
app.get("/", (_req, res) => {
  res.sendFile(path.join(_dirname, "public", "index.html"));
});

// --- health check --- //
app.get("/health", (_req, res) => res.send("ok"));

// ======================================
// /whereami — reverse geocode for A11y
// Query: lat, lng, accuracy?, heading?, lang? (en|fr)
// Returns: { speech, short, display_name, address, coords... }
// ======================================
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const geocodeCache = new Map(); // key -> payload

function cacheKey(lat, lng, lang) {
  // ~11m grid to avoid over-querying
  return `${lat.toFixed(4)},${lng.toFixed(4)},${lang}`;
}

function bearingToCardinal(bearing) {
  if (bearing == null || isNaN(bearing)) return null;
  const dirs = [
    "N","NNE","NE","ENE","E","ESE","SE","SSE",
    "S","SSW","SW","WSW","W","WNW","NW","NNW","N"
  ];
  return dirs[Math.round(((bearing % 360) / 22.5))];
}

function shortenAddress(addr = {}) {
  const {
    road, pedestrian, footway, cycleway, path, house_number,
    neighbourhood, suburb, city_district, village, town, city,
    municipality, county, state, postcode, country
  } = addr;

  const street = road || pedestrian || footway || cycleway || path;
  const locality =
    neighbourhood || suburb || city_district || city || town || village || municipality || county || state;

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
  const accStr =
    accuracy != null && !isNaN(accuracy) ? ` Accuracy about ${Math.round(accuracy)} meters.` : "";
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
      headers: {
        "User-Agent": "voice-aid-whereami/1.0 (+https://localhost)",
        "Accept-Language": lang,
      },
      timeout: 12000,
    });

    const display = data?.display_name || "";
    const short = shortenAddress(data?.address || {});
    const payload = {
      provider: "nominatim",
      display_name: display,
      short,
      address: data?.address || {},
    };

    geocodeCache.set(key, payload);

    const speech = buildSpeech({ lat, lng, accuracy, heading, shortAddress: short });
    res.json({ ...payload, coords: { lat, lng }, accuracy, heading, speech, cached: false });
  } catch (err) {
    console.error("/whereami error:", err?.response?.data || err.message);
    // Fallback: still give a speech string using coords if reverse geocode fails
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const fallbackSpeech = buildSpeech({
      lat,
      lng,
      accuracy: Number(req.query.accuracy),
      heading: Number(req.query.heading),
      shortAddress: "",
    });
    res.status(200).json({
      provider: "fallback",
      coords: { lat, lng },
      speech: fallbackSpeech,
    });
  }
});

// ======================================
// Optional Gemini proxy (/chat)
// Works even with no GEMINI_API_KEY: returns a safe fallback.
// ======================================
const PORT = process.env.PORT || 5050;
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_URL = GEMINI_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`
  : null;

const SYSTEM_GUIDE = `You are a calm, supportive assistant for a distress-aid widget.

Rules:
- Be concise, kind, nonjudgmental. Keep replies to 1–2 short sentences.
- Do NOT list or invent phone numbers. The UI shows helplines.
- Do NOT ask for the user's location. The UI handles that.
- If the user asks for helplines, reply like: