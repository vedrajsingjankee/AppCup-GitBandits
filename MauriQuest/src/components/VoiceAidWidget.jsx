import React, { useState, useEffect, useRef, useCallback } from 'react';
import './VoiceAidWidget.css';

const HELPLINES = {
  MU: [
    {id:"police", label:"Emergency (Police)", number:"999", aliases:["police","police emergency","call police","police hotline"]},
    {id:"emergency", label:"Emergency (General)", number:"112", aliases:["emergency","ambulance","fire","112","general emergency"]},
    {id:"samaritans", label:"Samaritans Mauritius (Emotional support)", href:"https://befriendersmauritius.org", aliases:["samaritans","emotional support","befrienders"]},
    {id:"moh", label:"Ministry of Health (Hotline)", number:"8924", aliases:["ministry of health","health hotline","moh"]}
  ],
  IN: [
    {id:"emergency", label:"Emergency", number:"112", aliases:["emergency","ambulance","fire","112"]},
    {id:"kiran", label:"Kiran Mental Health", number:"18005990019", aliases:["kiran","mental health"]}
  ],
  GB: [
    {id:"emergency", label:"Emergency", number:"999", aliases:["emergency","police","ambulance","fire","999"]},
    {id:"samaritans", label:"Samaritans", number:"116123", aliases:["samaritans","emotional support"]}
  ],
  US: [
    {id:"emergency", label:"Emergency", number:"911", aliases:["emergency","police","ambulance","fire","911"]},
    {id:"988", label:"988 Suicide & Crisis Lifeline", number:"988", aliases:["988","suicide","crisis"]}
  ],
  ZA: [
    {id:"emergency", label:"Emergency", number:"112", aliases:["emergency","ambulance","fire","112"]},
    {id:"sadag", label:"SADAG Suicide Crisis Line", number:"0800567567", aliases:["sadag","suicide","crisis"]}
  ],
};

const CALMING = [
  "Let's do 4-7-8 breathing. Inhale for 4 seconds… hold for 7… exhale for 8. I'll count with you.",
  "Try 5-4-3-2-1 grounding: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
  "Box breathing: Inhale for 4 seconds… hold for 4… exhale for 4… hold for 4. Let's do this together."
];

// Simple SVG Icons
const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

const MicOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="1" y1="1" x2="23" y2="23"></line>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const MessageCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const VoiceAidWidget = () => {
  // State variables
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [country, setCountry] = useState('MU');
  const [autoAnnounce, setAutoAnnounce] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // State for internal logic
  const [askedLocation, setAskedLocation] = useState(false);
  const [haveLocation, setHaveLocation] = useState(false);
  const [offeredHelplines, setOfferedHelplines] = useState(false);
  const [showedHelplines, setShowedHelplines] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [awaitingLocationConsent, setAwaitingLocationConsent] = useState(false);
  const [awaitingCallChoice, setAwaitingCallChoice] = useState(false);
  const [awaitingWhichHelpline, setAwaitingWhichHelpline] = useState(false);

  const [lastLocation, setLastLocation] = useState(null);
  const [lastCountry, setLastCountry] = useState(null);

  // Refs for DOM elements
  const logRef = useRef(null);
  const micBtnRef = useRef(null);

  // Speech Recognition and Synthesis
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const synth = window.speechSynthesis;

  let recognizing = useRef(false);
  let recognition = useRef(null);

  let watchId = useRef(null);
  let lastSpokenAt = useRef(0);

  // Panel control functions
  const addMsg = useCallback((text, who = 'bot') => {
    setMessages((prevMessages) => [...prevMessages, { type: 'text', text, who }]);
  }, []);

  const addActions = useCallback((buttons = []) => {
    setMessages((prevMessages) => [...prevMessages, { type: 'actions', data: buttons }]);
  }, []);

  const openPanel = useCallback(() => {
    setIsOpen(true);
    if (messages.length === 0) {
      const hello = "Hello, I'm your voice aid assistant. How can I help you today?";
      addMsg(hello, 'bot');
      speak(hello); // normal (non-blocking)
    }
  }, [messages.length, addMsg]);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    if (recognizing.current) {
      recognition.current?.stop();
      recognizing.current = false;
      setIsListening(false);
    }
  }, []);

  // ========= Normal AI Voice (neutral, steady) + non-cutting location =========
  // Prefer male-sounding English voices across platforms
const AI_VOICE_CANDIDATES = [
  // Chrome (Desktop/Android)
  'Google UK English Male',
  'Google US English', // Google sometimes exposes only this; often male-ish

  // Edge / Windows (online neural)
  'Microsoft Guy Online',
  'Microsoft David Online',
  'Microsoft Christopher Online',
  'Microsoft Ryan Online',

  // Windows legacy
  'Microsoft David Desktop',

  // macOS (Safari/Chrome)
  'Alex',
  'Daniel',
  'Oliver'
];

  const getBestVoice = useCallback(() => {
  if (!synth) return null;
  const voices = synth.getVoices?.() || [];
  if (!voices.length) return null;

  const byName = (needle) =>
    voices.find(v => v.name?.toLowerCase().includes(needle.toLowerCase()));

  // 1) Try explicit preferred names (in order)
  for (const name of AI_VOICE_CANDIDATES) {
    const v = byName(name);
    if (v) return v;
  }

  // 2) Any voice whose name hints "male"
  const maleHints = /(male|alex|daniel|david|george|guy|oliver|ryan|christopher)/i;
  const maleByHint = voices.find(v => maleHints.test(v.name || ''));
  if (maleByHint) return maleByHint;

  // 3) Any en-* voice (US, then GB, then any EN)
  const enUS = voices.find(v => /^en[-_]?US$/i.test(v.lang)) ||
               voices.find(v => v.lang?.toLowerCase().startsWith('en-us'));
  if (enUS) return enUS;

  const enGB = voices.find(v => /^en[-_]?GB$/i.test(v.lang)) ||
               voices.find(v => v.lang?.toLowerCase().startsWith('en-gb'));
  if (enGB) return enGB;

  const anyEN = voices.find(v => /^en\b/i.test(v.lang || ''));
  if (anyEN) return anyEN;

  // 4) Fallback default
  return voices.find(v => v.default) || voices[0];
}, [synth]);


  // Ensure voices are loaded (Chrome populates asynchronously)
  useEffect(() => {
    if (!synth) return;
    const preload = () => synth.getVoices?.();
    synth.addEventListener?.('voiceschanged', preload);
    preload();
    return () => synth.removeEventListener?.('voiceschanged', preload);
  }, [synth]);

  // Chunk text to avoid platform cut-offs and return a Promise when finished
  const speakAsync = useCallback((text, { interrupt = true } = {}) => {
  if (!synth || !text) return Promise.resolve();

  // Split on sentences AND commas to keep long addresses intact
  const chunks = [];
  const parts = String(text).split(/(?<=[.!?,])\s+/);
  parts.forEach(p => {
    if (p.length <= 160) {
      chunks.push(p);
    } else {
      let i = 0;
      while (i < p.length) {
        chunks.push(p.slice(i, i + 160));
        i += 160;
      }
    }
  });

  return new Promise(resolve => {
    const voice = getBestVoice();
    let idx = 0;

    const speakNext = () => {
      if (idx >= chunks.length) return resolve();
      const utter = new SpeechSynthesisUtterance(chunks[idx++]);
      if (voice) utter.voice = voice;
      utter.rate = 1.0;
      utter.pitch = 1.0;
      utter.volume = 1.0;
      utter.onend = speakNext;
      utter.onerror = speakNext;
      if (interrupt && idx === 1) synth.cancel();
      synth.speak(utter);
    };

    speakNext();
  });
}, [synth, getBestVoice]);

  // Fire-and-forget wrapper for normal messages
  const speak = useCallback((text) => {
    void speakAsync(text, { interrupt: true });
  }, [speakAsync]);
  // ===========================================================================

  const digitsSpaced = useCallback((num) => (num || "").split("").join(" "), []);
  const normalizeNum = useCallback((s) => (s || "").replace(/\D/g, ""), []);

  const doCalm = useCallback(() => {
    const tip = CALMING[Math.floor(Math.random() * CALMING.length)];
    addMsg(tip, 'bot');
    speak(tip);
  }, [addMsg, speak]);

  const followUpCalm = useCallback(() => {
    const q = "Are you okay now, or would you like calming exercises?";
    addMsg(q, 'bot');
    speak(q);
    addActions([
      { label: "I'm okay", onClick: () => { addMsg("I'm glad you're okay. I'm here if you need me again.", 'bot'); } },
      { label: "Calming exercises", onClick: doCalm }
    ]);
  }, [addMsg, speak, addActions, doCalm]);

  const callHelpline = useCallback((item) => {
    if (!item) return;

    if (item.number) {
      const say = `Calling ${item.label} at ${digitsSpaced(item.number)}.`;
      addMsg(say, 'bot');
      speak(say);

      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'callLink', label: `Tap to call ${item.label}`, href: `tel:${item.number}` },
      ]);

      const a = document.createElement('a');
      a.href = `tel:${item.number}`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 1500);

    } else if (item.href) {
      const say = `Opening ${item.label} website.`;
      addMsg(say, 'bot');
      speak(say);
      window.open(item.href, '_blank', 'noopener');
    }

    setAwaitingCallChoice(false);
    setAwaitingWhichHelpline(false);
    setTimeout(() => { followUpCalm(); }, 2000);
  }, [addMsg, speak, digitsSpaced, followUpCalm]);

  const speakHelplines = useCallback((code) => {
    const list = HELPLINES[code] || [];
    if (!list.length) return;
    const countryName = document.getElementById('country')?.options[document.getElementById('country')?.selectedIndex]?.textContent || "this country";
    const parts = list.map(it => it.number ? `${it.label}, ${digitsSpaced(it.number)}` : `${it.label}, website`);
    const speech = `Helplines for ${countryName}: ` + parts.join("; ") + ". Would you like me to call one? You can say 'Call Police' or say the number.";
    speak(speech);
  }, [speak, digitsSpaced]);

  const askCallPrompt = useCallback(() => {
    setAwaitingCallChoice(true);
    const q = "Would you like me to call one of them?";
    addMsg(q, 'bot');
    speak(q);
    addActions([
      { label: "Yes, call a helpline", onClick: () => { setAwaitingCallChoice(false); setAwaitingWhichHelpline(true); const q2 = "Which one should I call? You can say 'Police' or the number."; addMsg(q2, 'bot'); speak(q2); } },
      { label: "No, thanks", onClick: () => { setAwaitingCallChoice(false); followUpCalm(); } }
    ]);
  }, [addMsg, speak, addActions, followUpCalm]);

  const renderHelplines = useCallback((code) => {
    const list = HELPLINES[code] || [];
    if (!list.length) {
      addMsg("No helplines configured for this country yet.", 'bot');
      return;
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      { type: 'helplines', data: list, callHelpline: callHelpline, digitsSpaced: digitsSpaced },
    ]);

    speakHelplines(code);
    askCallPrompt();
  }, [addMsg, speakHelplines, askCallPrompt, callHelpline, digitsSpaced]);

  const renderMap = useCallback((lat, lon, addressText) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: 'map', lat, lon, addressText },
    ]);
  }, []);

  const reverseGeocode = useCallback(async (lat, lon) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
      const r = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'voice-aid-demo' } });
      const j = await r.json();
      const countryCode = j?.address?.country_code?.toUpperCase() || null;
      const display = j?.display_name || null;
      return { countryCode, display };
    } catch {
      return { countryCode: null, display: null };
    }
  }, []);

  // Always SPEAK the location fully (await TTS) before any other prompts
  const describeAndSpeakFromPosition = useCallback(async (pos) => {
  const { latitude: lat, longitude: lon, accuracy, heading } = pos.coords || pos;

  // Try /whereami first for a rich address; fall back to OSM reverse geocode
  let fullAddress = null;
  try {
    const r = await fetch(`/whereami?lat=${lat}&lng=${lon}&accuracy=${accuracy || ''}&heading=${heading || ''}&lang=en`);
    const j = await r.json();
    fullAddress = j.display_name || j.short || null;
  } catch {}

  if (!fullAddress) {
    const rev = await reverseGeocode(lat, lon);
    fullAddress = rev.display || null;
  }

  // Show the map immediately so it's visible while the AI speaks
  renderMap(lat, lon, fullAddress);

  // Speak the FULL address (not shortened), then coordinates
  const msg = fullAddress
    ? `Your exact location is: ${fullAddress}. Coordinates: latitude ${lat.toFixed(5)}, longitude ${lon.toFixed(5)}.`
    : `Your coordinates are latitude ${lat.toFixed(5)}, longitude ${lon.toFixed(5)}.`;

  addMsg(msg, 'bot');
  await speakAsync(msg, { interrupt: true }); // wait until TTS fully finishes

  // stash last position for the "Where Am I?" button
  window._lastPos = { coords: { latitude: lat, longitude: lon, accuracy, heading } };
}, [addMsg, speakAsync, renderMap, reverseGeocode]);


  const askHelplinesOffer = useCallback(() => {
    if (offeredHelplines) return;
    setOfferedHelplines(true);
    const q = "Do you want me to show the nearest helplines?";
    addMsg(q, 'bot');
    speak(q);
    addActions([
      { label: "Yes, show helplines", onClick: () => showHelplinesAndFollowUp() },
      { label: "No, thanks", onClick: followUpCalm }
    ]);
  }, [offeredHelplines, addMsg, speak, addActions, followUpCalm]);

  const showHelplinesAndFollowUp = useCallback(() => {
    if (showedHelplines) { askCallPrompt(); return; }
    renderHelplines(lastCountry || country);
    setShowedHelplines(true);
  }, [showedHelplines, renderHelplines, lastCountry, country, askCallPrompt]);

  const getLocationThenProceed = useCallback(() => {
    if (gettingLocation) return;
    setGettingLocation(true);

    if (!navigator.geolocation) {
      const t = "Location not supported on this device. You can still choose your country.";
      addMsg(t, 'bot');
      speak(t);
      setGettingLocation(false);
      return;
    }
    addMsg("Getting your location…", 'bot');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lon, accuracy } = pos.coords;

      await describeAndSpeakFromPosition(pos); // waits for TTS to finish

      const rev = await reverseGeocode(lat, lon);
      setLastLocation({ lat, lon, accuracy, address: rev.display, country: rev.countryCode });
      setHaveLocation(true);
      setGettingLocation(false);

      if (rev.countryCode) { setLastCountry(rev.countryCode); if (HELPLINES[rev.countryCode]) setCountry(rev.countryCode); }

      // This now runs AFTER the location has fully spoken
      askHelplinesOffer();
    }, (() => {
      const t = "I couldn't get your location. You can still pick your country from the dropdown.";
      addMsg(t, 'bot');
      speak(t);
      setGettingLocation(false);
    }), { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
  }, [gettingLocation, addMsg, speak, describeAndSpeakFromPosition, reverseGeocode, askHelplinesOffer]);

  const askShareLocationFlow = useCallback((promptOverride) => {
    if (haveLocation) { return askHelplinesOffer(); }
    if (askedLocation && !promptOverride) return;
    setAskedLocation(true);
    setAwaitingLocationConsent(true);

    const msg = promptOverride || "Would you like me to show you exactly where you are? ";
    addMsg(msg, 'bot');
    speak(msg);
    addActions([
      { label: "Share my location", onClick: () => { setAwaitingLocationConsent(false); getLocationThenProceed(); } },
      { label: "Not now", onClick: () => { setAwaitingLocationConsent(false); const t = "Okay. You can still pick a country below or ask for calming."; addMsg(t, 'bot'); speak(t); } }
    ]);
  }, [haveLocation, askedLocation, addMsg, speak, addActions, getLocationThenProceed, askHelplinesOffer]);

  const findHelplineBySpeech = useCallback((input, countryCode) => {
    const cc = countryCode || country;
    const list = (HELPLINES[cc] || []);
    const text = (input || "").toLowerCase();

    for (const it of list) {
      const aliases = [it.label.toLowerCase(), ...(it.aliases || [])];
      if (aliases.some(a => a && text.includes(a))) return it;
    }
    const nums = text.match(/\d+/g) || [];
    for (const it of list) {
      if (!it.number) continue;
      const n = normalizeNum(it.number);
      if (nums.some(x => normalizeNum(x) === n)) return it;
      if (text.includes(it.number)) return it;
      if (text.includes(digitsSpaced(it.number))) return it;
    }
    return null;
  }, [country, normalizeNum, digitsSpaced]);

  const askGemini = useCallback(async (text) => {
    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      return data.reply || "I'm here. Let's take a slow breath together.";
    } catch (e) {
      return "I'm here. If this is an emergency, please call your local emergency number now.";
    }
  }, []);

  const distressKeywords = useRef(["i am lost", "im lost", "help me", "panic", "scared", "anxious", "anxiety", "i need help", "can you help me", "i feel unsafe", "local helpline", "helpline"]);
  const looksDistressed = useCallback((t) => { t = t.toLowerCase(); return distressKeywords.current.some(k => t.includes(k)); }, []);

  const locCmd = useRef(/(show|share|get)\s+(?:me\s+)?(?:my\s+)?location\b|\bwhere\s+am\s+i\b|\bwhat(?:'s| is)\s+my\s+location\b/i);
  const nearestCmd = useRef(/\b(nearest|nearby)\s+helplines?\b|\bhelplines?\s+(near|around)\s+me\b|\bshow\s+(the\s+)?(nearest|nearby)\s+helplines?\b/i);

  const yesish = useRef(/\b(yes|yeah|yep|yup|please|ok|okay|sure|show|go ahead)\b/i);
  const noish = useRef(/\b(no|nah|nope|not now|later)\b/i);

  const handleUserText = useCallback(async (text) => {
    if (!text) return;
    addMsg(text, 'me');
    const lower = text.toLowerCase();

    if (awaitingLocationConsent) {
      if (yesish.current.test(lower)) {
        setAwaitingLocationConsent(false);
        await getLocationThenProceed();
      } else if (noish.current.test(lower)) {
        setAwaitingLocationConsent(false);
        const t = "Okay. You can still pick a country below or ask for calming.";
        addMsg(t, 'bot');
        speak(t);
      } else {
        const t = "I'm still waiting for your response regarding sharing your location. Please say 'yes' or 'no'.";
        addMsg(t, 'bot');
        speak(t);
      }
      return;
    }

    if (/\b(call|dial|phone|ring)\b/.test(lower)) {
      const item = findHelplineBySpeech(lower, lastCountry || country);
      if (item) { callHelpline(item); return; }
      setAwaitingWhichHelpline(true); const q = "Which one should I call? You can say 'Police' or the number."; addMsg(q, 'bot'); speak(q); return;
    }
    if (awaitingWhichHelpline) {
      const item = findHelplineBySpeech(lower, lastCountry || country);
      if (item) { setAwaitingWhichHelpline(false); callHelpline(item); return; }
    }
    if (awaitingCallChoice) {
      if (yesish.current.test(lower)) { setAwaitingCallChoice(false); setAwaitingWhichHelpline(true); const q = "Which one should I call?"; addMsg(q, 'bot'); speak(q); return; }
      if (noish.current.test(lower)) { setAwaitingCallChoice(false); followUpCalm(); return; }
    }

    if (locCmd.current.test(lower)) { await getLocationThenProceed(); return; }
    if (nearestCmd.current.test(lower)) {
      if (haveLocation) { showHelplinesAndFollowUp(); return; }
      askShareLocationFlow(); return;
    }

    if (offeredHelplines && !showedHelplines) {
      if (yesish.current.test(lower)) { showHelplinesAndFollowUp(); return; }
      if (noish.current.test(lower)) { followUpCalm(); return; }
    }

    if (/\b(i'?m|i am)\s+lost\b/i.test(lower)) {
      const line1 = "I'm sorry to hear that. Take a few slow deep breaths. It's okay to feel this way. ";
      addMsg(line1, 'bot');
      speak(line1);
      askShareLocationFlow("Would you like me to show you exactly where you are? ");
      return;
    }

    if (lower.includes("helpline")) {
      if (haveLocation) { showHelplinesAndFollowUp(); return; }
      askShareLocationFlow(); return;
    }

    if (looksDistressed(lower)) {
      const reply = await askGemini(text);
      addMsg(reply, 'bot');
      speak(reply);
      askShareLocationFlow("Would you like me to show you exactly where you are? ");
      return;
    }

    if (lower.includes("calm") || lower.includes("breath")) { doCalm(); return; }

    const reply = await askGemini(text);
    addMsg(reply, 'bot');
    speak(reply);
  }, [addMsg, speak, awaitingLocationConsent, getLocationThenProceed, findHelplineBySpeech, lastCountry, country, callHelpline, followUpCalm, haveLocation, showHelplinesAndFollowUp, askShareLocationFlow, offeredHelplines, showedHelplines, looksDistressed, askGemini, doCalm]);

  // Effect for scrolling to bottom of log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  // Effect for initializing STT
  useEffect(() => {
    if (!SpeechRecognition) {
      addMsg("Speech recognition not supported in this browser. You can type instead.", "bot");
      return;
    }

    recognition.current = new SpeechRecognition();
    recognition.current.lang = "en-US";
    recognition.current.interimResults = true;
    recognition.current.continuous = false;

    recognition.current.onresult = (e) => {
      let final = "", interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }

      if (final) {
        handleUserText(final.trim());
      }
    };

    recognition.current.onerror = () => {
      setIsListening(false);
      recognizing.current = false;
    };

    recognition.current.onend = () => {
      setIsListening(false);
      recognizing.current = false;
    };

    return () => {
      if (recognition.current) recognition.current.stop();
    };
  }, [SpeechRecognition, handleUserText, addMsg]);

  // Effect for auto announce
  useEffect(() => {
    if (autoAnnounce) {
      if (!navigator.geolocation) {
        addMsg("Location not supported on this device for auto announce.", 'bot');
        setAutoAnnounce(false);
        return;
      }
      if (watchId.current !== null) return;

      watchId.current = navigator.geolocation.watchPosition((pos) => {
        window._lastPos = pos; // Keep for whereBtn
        const now = Date.now();
        if (now - lastSpokenAt.current < 10000) return;
        lastSpokenAt.current = now;
        describeAndSpeakFromPosition(pos);
      }, () => { }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
    } else {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [autoAnnounce, addMsg, describeAndSpeakFromPosition]);

  // Toggle speech recognition
  const toggleSpeechRecognition = useCallback(() => {
    if (!recognition.current) return;

    if (!recognizing.current) {
      recognizing.current = true;
      setIsListening(true);
      recognition.current.start();
      setTimeout(() => {
        if (recognizing.current) recognition.current.stop();
      }, 8000);
    } else {
      recognition.current.stop();
    }
  }, []);

  return (
    <>
      {/* Floating Launcher Button */}
      <div 
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 z-50 flex items-center gap-2"
        onClick={openPanel}
      >
        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        <span className="font-semibold flex items-center gap-2">
          <MessageCircleIcon />
          SOS Voice
        </span>
      </div>

      {/* Main Panel */}
      <div className={`fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 transform ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      } z-50`}>
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <h2 className="font-bold text-lg">Calm Assist</h2>
          </div>
          <button 
            onClick={closePanel}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Messages Area */}
        <div 
          ref={logRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        >
          {messages.map((msg, index) => (
            <div key={index} className="space-y-2">
              {msg.type === 'text' && (
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.who === 'me' 
                    ? 'bg-blue-500 text-white ml-auto rounded-br-md' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                }`}>
                  {msg.text}
                </div>
              )}
              
              {msg.type === 'actions' && msg.data && (
                <div className="flex flex-wrap gap-2 p-2">
                  {msg.data.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={action.onClick}
                      className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              
              {msg.type === 'helplines' && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-gray-800">Helplines:</h3>
                  {msg.data.map((it, helplineIndex) => (
                    <div key={helplineIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">{it.label}</div>
                        <div className="text-sm text-gray-600">
                          {it.number ? digitsSpaced(it.number) : 'Website'}
                        </div>
                      </div>
                      <button
                        onClick={() => msg.callHelpline(it)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm transition-colors flex items-center gap-1"
                      >
                        <PhoneIcon />
                        {it.number ? 'Call' : 'Open'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {msg.type === 'callLink' && (
                <div className="p-2">
                  <a
                    href={msg.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm transition-colors"
                  >
                    {msg.label}
                  </a>
                </div>
              )}
              
              {msg.type === 'map' && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <MapPinIcon />
                    Your Location
                  </h3>
                  {msg.addressText && (
                    <p className="text-gray-600 mb-2">{msg.addressText}</p>
                  )}
                  <p className="text-sm text-gray-500 mb-2">
                    Coords: {msg.lat.toFixed(5)}, {msg.lon.toFixed(5)}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${msg.lat},${msg.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Open in Google Maps
                  </a>
                  <div className="mt-3 rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-48 border-0"
                      src={`https://www.google.com/maps?q=${msg.lat},${msg.lon}&z=16&output=embed`}
                      title="Location map"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="p-4 bg-white border-t border-gray-200 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleSpeechRecognition}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {isListening ? <MicOffIcon /> : <MicIcon />}
              {isListening ? 'Listening...' : 'Speak'}
            </button>
            
            <button
              onClick={doCalm}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm font-medium transition-colors"
            >
              <HeartIcon />
              Calm Me
            </button>
            
            <button
              onClick={() => askShareLocationFlow()}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-full text-sm font-medium transition-colors"
            >
              <PhoneIcon />
              Helplines
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => {
                if (window._lastPos) return describeAndSpeakFromPosition(window._lastPos);
                askShareLocationFlow("Would you like me to show and say where you are? ");
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-full text-sm font-medium transition-colors"
            >
              <MapPinIcon />
              Where Am I?
            </button>
            
            <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={autoAnnounce}
                onChange={(e) => setAutoAnnounce(e.target.checked)}
                className="mr-1"
              />
              Auto Announce
            </label>
            
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
            >
              <option value="MU">🇲🇺 Mauritius</option>
              <option value="IN">🇮🇳 India</option>
              <option value="GB">🇬🇧 UK</option>
              <option value="US">🇺🇸 USA</option>
              <option value="ZA">🇿🇦 South Africa</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleUserText(typedMessage.trim()); setTypedMessage(''); } }}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => { handleUserText(typedMessage.trim()); setTypedMessage(''); }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VoiceAidWidget;
