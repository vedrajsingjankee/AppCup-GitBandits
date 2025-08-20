import React, { useState, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Destinations from './components/Destinations';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ChatbotIcon from './components/ChatbotIcon';
import VoiceAidWidget from './components/VoiceAidWidget';
import ItineraryForm from './components/ItineraryForm';
import ItineraryResults from './components/ItineraryResults';
import { GoogleGenAI } from "https://esm.sh/@google/genai";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import P5TravelBg from './components/P5TravelBg.jsx';

export default function App() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [showVoiceAid, setShowVoiceAid] = useState(false);
  const [showItineraryForm, setShowItineraryForm] = useState(false);
  const [showItineraryResults, setShowItineraryResults] = useState(false);
  const [itineraryData, setItineraryData] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  const handleIconClick = () => {
    setShowOptions(!showOptions);
  };

  const handleOptionSelect = (option) => {
    setShowOptions(false);
    if (option === 'chat') {
      setShowChatbot(true);
      setShowVoiceAid(false);
      setShowItineraryForm(false);
    } else if (option === 'voice') {
      setShowVoiceAid(true);
      setShowChatbot(false);
      setShowItineraryForm(false);
    }
  };

  const handleClose = () => {
    setShowChatbot(false);
    setShowVoiceAid(false);
    setShowItineraryForm(false);
    setShowItineraryResults(false);
  };

  const handleItineraryGenerated = (data) => {
    setItineraryData(data);
    setShowItineraryResults(true);
  };

  const handleRegenerateItinerary = () => {
    setShowItineraryResults(false);
    setShowItineraryForm(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #f8fafc 60%, #e0f2fe 100%)',
      }}
    >
      <P5TravelBg />
      {/* Overlay for tropical effect */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(120deg,rgba(0,0,0,0.10) 0%,rgba(0,0,0,0.22) 100%)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Hero />
        <div className="my-12">
          <ItineraryForm onItineraryGenerated={handleItineraryGenerated} />
        </div>
        <ImageUploader />
        <Destinations />
      </main>
      <Footer />

      {/* floating menu icon */}
      <ChatbotIcon 
        onClick={handleIconClick} 
        showOptions={showOptions}
        onOptionSelect={handleOptionSelect}
      />

      {/* chat panel */}
      {showChatbot && (
        <div
          className="fixed bottom-24 right-8 z-50"
          style={{ width: 360, maxWidth: 'calc(100vw - 2rem)' }}
        >
          <div style={{
            background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(2,6,23,.35)'
          }}>
            <Chatbot onClose={handleClose} />
          </div>
        </div>
      )}

      {/* Voice Aid Widget */}
      {showVoiceAid && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(2,6,23,0.55)' }}
          onClick={handleClose}
        >
          <div
            className="relative"
            style={{ width: 'min(420px, 92vw)', height: 'min(640px, 88vh)' }}
            onClick={(e)=> e.stopPropagation()}
          >
            <VoiceAidWidget onClose={handleClose} />
            <button
              onClick={handleClose}
              aria-label="Close"
              style={{
                position: 'absolute', top: -12, right: -12,
                width: 36, height: 36, borderRadius: 9999, border: 'none', cursor: 'pointer',
                background: '#0f172a', color: '#fff', boxShadow: '0 6px 16px rgba(2,6,23,.4)'
              }}
            >✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ... rest of your App.jsx code (PalmSVG, ImageUploader, etc.)
// --- Static SVG Palm Tree for tropical vibe ---
function PalmSVG() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="18" ry="6" fill="#b6e2d3" />
      <rect x="36" y="40" width="8" height="28" rx="4" fill="#a3a380" />
      <path d="M40 40 Q30 30 20 40" stroke="#4fd1c5" strokeWidth="4" fill="none" />
      <path d="M40 40 Q50 30 60 40" stroke="#4fd1c5" strokeWidth="4" fill="none" />
      <circle cx="40" cy="38" r="8" fill="#4fd1c5" />
    </svg>
  );
}

// --- Fireship-style ImageUploader ---
const ImageUploader = () => {
  const [result, setResult] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  // Convert file to Base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // AI response schema
  const schema = {
    type: "object",
    properties: {
      landmarkCandidates: { type: "array", items: { type: "string" } },
      cityHints: { type: "array", items: { type: "string" } },
      countryHints: { type: "array", items: { type: "string" } },
      textOnSigns: { type: "array", items: { type: "string" } },
      languages: { type: "array", items: { type: "string" } },
      confidence: { type: "number" },
    },
    required: ["confidence"],
  };

  // Build query string from AI result
  const getLocationQuery = (result) => {
    const parts = [
      result.landmarkCandidates?.[0],
      result.cityHints?.[0],
      result.countryHints?.[0],
    ].filter(Boolean);
    return parts.join(", ");
  };

  // Fetch coordinates from OpenStreetMap
  const fetchCoordinates = async (query) => {
    if (!query) return null;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=1`
    );
    const data = await response.json();
    if (data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  };

  // Analyze image using AI
  const analyzeImage = async (file) => {
    const base64 = await fileToBase64(file);

    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { inlineData: { mimeType: file.type, data: base64 } },
        {
          text: [
            "You are a localization assistant.",
            "From this single image, extract any CLUES about location.",
            "Return ONLY JSON that matches the provided schema.",
          ].join(" "),
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    let data;
    try {
      data = JSON.parse(resp.text ?? "{}");
    } catch {
      data = { raw: resp.text };
    }
    setResult(data);

    // --- New: Get map coordinates ---
    const locationQuery = getLocationQuery(data);
    const coords = await fetchCoordinates(locationQuery);
    setCoordinates(coords);
  };

  return (
    <div
      className="my-12 p-0 rounded-3xl shadow-xl relative overflow-hidden"
      style={{
        background: "#fff",
        maxWidth: 520,
        margin: "0 auto",
        boxShadow: "0 8px 32px 0 rgba(30,41,59,0.10), 0 1.5px 8px 0 rgba(56,189,248,0.10)",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        border: "none",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Subtle floating accent */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 180,
          height: 180,
          background: "radial-gradient(circle at 40% 60%, #38bdf8 0%, transparent 70%)",
          opacity: 0.13,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: -60,
          width: 180,
          height: 180,
          background: "radial-gradient(circle at 60% 40%, #ffe066 0%, transparent 70%)",
          opacity: 0.10,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Professional header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: "2.5rem 2.5rem 1.5rem 2.5rem",
        zIndex: 2,
        position: "relative"
      }}>
        <span style={{
          fontSize: 38,
          background: "linear-gradient(90deg,#38bdf8 60%,#ffe066 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 2px 8px #38bdf822)"
        }}>🧭</span>
        <div>
          <h2 style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#22223b",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            letterSpacing: 0.5,
            marginBottom: 2,
            lineHeight: 1.1
          }}>
            Lost Tourist Helper
          </h2>
          <div style={{
            color: "#64748b",
            fontWeight: 500,
            fontSize: 15.5,
            marginTop: 2,
            fontFamily: "'Inter', 'Segoe UI', sans-serif"
          }}>
            Instantly pinpoint your travel photo's location with AI.
          </div>
        </div>
      </div>

      {/* Animated upload button */}
      <div style={{ padding: "0 2.5rem 2.5rem 2.5rem", zIndex: 2, position: "relative" }}>
        <label
          htmlFor="file-upload"
          className="block mb-5 cursor-pointer group"
          style={{
            background: "#18181b",
            color: "#fff",
            padding: "1.05rem 2rem",
            borderRadius: "1.2rem",
            fontWeight: 700,
            fontSize: 18,
            display: "inline-block",
            boxShadow: "0 2px 12px #38bdf822",
            border: "none",
            letterSpacing: 0.2,
            transition: "transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s, background 0.18s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.06) translateY(-2px)";
            e.currentTarget.style.background = "#2563eb";
            e.currentTarget.style.boxShadow = "0 8px 32px #38bdf855";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.background = "#18181b";
            e.currentTarget.style.boxShadow = "0 2px 12px #38bdf822";
          }}
        >
          <span role="img" aria-label="camera" style={{ marginRight: 10, fontSize: 22 }}>📸</span>
          Upload a travel photo
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) analyzeImage(file);
            }}
            style={{ display: "none" }}
          />
        </label>

        {/* AI Analysis Results */}
        {result && (
          <div
            className="space-y-3 mt-8"
            style={{
              background: "#f8fafc",
              borderRadius: 18,
              padding: "1.2rem 1.5rem",
              boxShadow: "0 2px 12px #38bdf822",
              border: "none",
              marginBottom: 12,
              fontSize: 17,
              animation: "fadeInUp 0.7s cubic-bezier(.4,2,.6,1)",
            }}
          >
            <li style={{ fontWeight: 800, color: "#2563eb", fontSize: 19, listStyle: "none" }}>
              <span role="img" aria-label="confidence">✅</span> Confidence:{" "}
              <span style={{ color: "#f59e42" }}>{Math.round(result.confidence * 100)}%</span>
            </li>
            {result.countryHints?.length > 0 && (
              <li style={{ fontWeight: 700, color: "#4fd1c5", listStyle: "none" }}>
                <span role="img" aria-label="country">🌍</span> Country:{" "}
                <span style={{ color: "#2563eb" }}>{result.countryHints.join(", ")}</span>
              </li>
            )}
            {result.cityHints?.length > 0 && (
              <li style={{ fontWeight: 700, color: "#6366f1", listStyle: "none" }}>
                <span role="img" aria-label="city">🏙</span> City:{" "}
                <span style={{ color: "#38bdf8" }}>{result.cityHints.join(", ")}</span>
              </li>
            )}
            {result.landmarkCandidates?.length > 0 && (
              <li style={{ fontWeight: 700, color: "#f59e42", listStyle: "none" }}>
                <span role="img" aria-label="landmark">🏛</span> Landmark:{" "}
                <span style={{ color: "#38bdf8" }}>{result.landmarkCandidates.join(", ")}</span>
              </li>
            )}
            {result.textOnSigns?.length > 0 && (
              <li style={{ fontWeight: 700, color: "#38bdf8", listStyle: "none" }}>
                <span role="img" aria-label="signs">🪧</span> Signs:{" "}
                <span style={{ color: "#6366f1" }}>{result.textOnSigns.join(", ")}</span>
              </li>
            )}
            {result.languages?.length > 0 && (
              <li style={{ fontWeight: 700, color: "#6366f1", listStyle: "none" }}>
                <span role="img" aria-label="language">🌐</span> Language:{" "}
                <span style={{ color: "#38bdf8" }}>{result.languages.join(", ")}</span>
              </li>
            )}
          </div>
        )}

        {/* Map Display */}
        {coordinates && (
          <div className="mt-10 relative" style={{ animation: "fadeInUp 0.7s cubic-bezier(.4,2,.6,1)" }}>
            <h3 className="text-lg font-bold mb-3" style={{
              color: "#2563eb",
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
              textShadow: "0 2px 8px #fffbe6cc"
            }}>
              <span role="img" aria-label="pin">📍</span> Estimated Location
            </h3>
            <div style={{
              borderRadius: 16,
              boxShadow: "0 4px 24px #38bdf822",
              overflow: "hidden",
              background: "#fff",
              marginBottom: 10,
            }}>
              <MapContainer
                center={[coordinates.lat, coordinates.lon]}
                zoom={13}
                style={{ height: "260px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={[coordinates.lat, coordinates.lon]}>
                  <Popup>{coordinates.display_name}</Popup>
                </Marker>
              </MapContainer>
            </div>
            <div style={{
              background: "#e0f2fe",
              color: "#2563eb",
              borderRadius: 12,
              padding: "0.6rem 1.1rem",
              fontWeight: 700,
              fontSize: 15,
              boxShadow: "0 2px 8px #38bdf822",
              marginTop: 6,
              display: "inline-block"
            }}>
              <span role="img" aria-label="tip">💡</span> Tip: Click the map marker for more info!
            </div>
          </div>
        )}
      </div>

      {/* Animation keyframes */}
      <style>
        {`
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(32px);}
            100% { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
};