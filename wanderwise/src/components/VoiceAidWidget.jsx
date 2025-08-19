import React, { useState, useEffect, useRef, useCallback } from 'react';
import './VoiceAidWidget.css'; // Import the extracted CSS

const HELPLINES = {
  MU: [
    {id:"police",     label:"Emergency (Police)", number:"999",          aliases:["police","police emergency","call police","police hotline"]},
    {id:"emergency",  label:"Emergency (General)", number:"112",         aliases:["emergency","ambulance","fire","112","general emergency"]},
    {id:"samaritans", label:"Samaritans Mauritius (Emotional support)", href:"https://befriendersmauritius.org", aliases:["samaritans","emotional support","befrienders"]},
    {id:"moh",        label:"Ministry of Health (Hotline)", number:"8924", aliases:["ministry of health","health hotline","moh"]}
  ],
  IN: [
    {id:"emergency",  label:"Emergency", number:"112", aliases:["emergency","ambulance","fire","112"]},
    {id:"kiran",      label:"Kiran Mental Health", number:"18005990019", aliases:["kiran","mental health"]}
  ],
  GB: [
    {id:"emergency",  label:"Emergency", number:"999", aliases:["emergency","police","ambulance","fire","999"]},
    {id:"samaritans", label:"Samaritans", number:"116123", aliases:["samaritans","emotional support"]}
  ],
  US: [
    {id:"emergency",  label:"Emergency", number:"911", aliases:["emergency","police","ambulance","fire","911"]},
    {id:"988",        label:"988 Suicide & Crisis Lifeline", number:"988", aliases:["988","suicide","crisis"]}
  ],
  ZA: [
    {id:"emergency",  label:"Emergency", number:"112", aliases:["emergency","ambulance","fire","112"]},
    {id:"sadag",      label:"SADAG Suicide Crisis Line", number:"0800567567", aliases:["sadag","suicide","crisis"]}
  ],
};

const CALMING = [
  "Let's do 4-7-8 breathing. Inhale 4… hold 7… exhale 8. I'll count with you.",
  "Try 5-4-3-2-1 grounding: 5 things you can see, 4 touch, 3 hear, 2 smell, 1 taste.",
  "Box breathing. Inhale 4… hold 4… exhale 4… hold 4. Repeat a few rounds."
];

const VoiceAidWidget = () => {
  // State variables
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [country, setCountry] = useState('MU');
  const [autoAnnounce, setAutoAnnounce] = useState(false);

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
  let interimEl = useRef(null);

  let watchId = useRef(null);
  let lastSpokenAt = useRef(0);

  // Panel control functions
  const openPanel = useCallback(() => {
    setIsOpen(true);
    // Add initial message when opening
    if (messages.length === 0) {
      addMsg("Hello, I'm your voice aid assistant. How can I help you today?", 'bot');
    }
  }, [messages.length]);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Helper functions
  const addMsg = useCallback((text, who = 'bot') => {
    setMessages((prevMessages) => [...prevMessages, { type: 'text', text, who }]);
  }, []);

  const addActions = useCallback((buttons = []) => {
    setMessages((prevMessages) => [...prevMessages, { type: 'actions', data: buttons }]);
  }, []);

  // Improved speech synthesis with more natural voice
  const speak = useCallback((text) => {
    if (!synth) return;
    
    // Cancel any ongoing speech
    synth.cancel();
    
    // Create a more natural speaking pattern by splitting text into phrases
    const phrases = text.split(/(?<=[.!?;])|(?<=,\s)/g).filter(p => p.trim().length > 0);
    
    let delay = 0;
    const pauseDuration = 150; // ms pause between phrases
    
    phrases.forEach((phrase, index) => {
      setTimeout(() => {
        if (phrase.trim()) {
          const u = new SpeechSynthesisUtterance(phrase.trim());
          
          // Try to select a more natural voice
          const voices = synth.getVoices();
          const preferredVoices = [
            'Google UK English Female',
            'Google US English',
            'Microsoft Hazel - English (Great Britain)',
            'Microsoft David - English (United States)',
            'Microsoft Zira - English (United States)',
            'Microsoft Susan - English (Great Britain)',
            'Samantha',
            'Karen',
            'Daniel',
            'Alex' // macOS voice, often high quality
          ];
          
          // Find the first available preferred voice
          const selectedVoice = voices.find(voice =>
            preferredVoices.includes(voice.name)
          ) || voices.find(voice => voice.lang.startsWith('en')); // Use startsWith for broader English match
          
          if (selectedVoice) {
            u.voice = selectedVoice;
          }
          
          // Set more natural parameters
          u.rate = 0.9; // Slightly slower for a more measured pace
          u.pitch = 1.0; // Normal pitch
          u.volume = 0.8; // Slightly lower volume for a softer tone
          
          // Add subtle variations for more natural sound
          if (index % 3 === 0) u.rate = 0.88; // More variation
          if (index % 5 === 0) u.pitch = 1.03; // More variation
          
          synth.speak(u);
        }
      }, delay);
      
      // Add pause between phrases
      delay += pauseDuration;
    });
  }, [synth]);

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
  }, [addMsg, speak, digitsSpaced, setAwaitingCallChoice, setAwaitingWhichHelpline, followUpCalm]);

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
  }, [addMsg, speak, addActions, setAwaitingCallChoice, setAwaitingWhichHelpline, followUpCalm]);

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

  const describeAndSpeakFromPosition = useCallback(async (pos) => {
    const { latitude: lat, longitude: lon, accuracy, heading } = pos.coords || pos;
    try {
      const r = await fetch(`/whereami?lat=${lat}&lng=${lon}&accuracy=${accuracy || ''}&heading=${heading || ''}&lang=en`);
      const j = await r.json();
      const msg = j.speech || `Your coordinates are latitude ${lat.toFixed(5)}, longitude ${lon.toFixed(5)}.`;
      addMsg(msg, 'bot');
      speak(msg);
      renderMap(lat, lon, j.short || j.display_name || null);
      window._lastPos = { coords: { latitude: lat, longitude: lon, accuracy, heading } };
    } catch {
      const rev = await reverseGeocode(lat, lon);
      const msg = rev.display ? `You are near ${rev.display}.` : `Your coordinates are latitude ${lat.toFixed(5)}, longitude ${lon.toFixed(5)}.`;
      addMsg(msg, 'bot');
      speak(msg);
      renderMap(lat, lon, rev.display);
      window._lastPos = { coords: { latitude: lat, longitude: lon, accuracy, heading } };
    }
  }, [addMsg, speak, renderMap, reverseGeocode]);

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
  }, [showedHelplines, renderHelplines, lastCountry, country, askCallPrompt, setShowedHelplines]);

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

      await describeAndSpeakFromPosition(pos);

      const rev = await reverseGeocode(lat, lon);
      setLastLocation({ lat, lon, accuracy, address: rev.display, country: rev.countryCode });
      setHaveLocation(true);
      setGettingLocation(false);

      if (rev.countryCode) { setLastCountry(rev.countryCode); if (HELPLINES[rev.countryCode]) setCountry(rev.countryCode); }

      askHelplinesOffer();
    }, (() => {
      const t = "I couldn't get your location. You can still pick your country from the dropdown.";
      addMsg(t, 'bot');
      speak(t);
      setGettingLocation(false);
    }), { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
  }, [gettingLocation, addMsg, speak, describeAndSpeakFromPosition, reverseGeocode, setLastLocation, setHaveLocation, setGettingLocation, setLastCountry, setCountry, askHelplinesOffer]);

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
  }, [haveLocation, askedLocation, addMsg, speak, addActions, setAskedLocation, setAwaitingLocationConsent, getLocationThenProceed, askHelplinesOffer]);

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
      const line1 = "I'm sorry to hear that. Take a few slow, deep breaths. It's okay to feel this way. ";
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
  }, [addMsg, speak, awaitingLocationConsent, getLocationThenProceed, findHelplineBySpeech, lastCountry, country, callHelpline, setAwaitingWhichHelpline, awaitingWhichHelpline, awaitingCallChoice, setAwaitingCallChoice, followUpCalm, haveLocation, showHelplinesAndFollowUp, askShareLocationFlow, offeredHelplines, showedHelplines, looksDistressed, askGemini, doCalm]);

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
      if (micBtnRef.current) {
        micBtnRef.current.disabled = true;
        micBtnRef.current.textContent = "Not Supported";
      }
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

      // This part needs careful React adaptation for interimEl
      // For now, just handle final results
      if (final) {
        handleUserText(final.trim());
      }
    };

    recognition.current.onerror = () => {
      if (micBtnRef.current) micBtnRef.current.classList.remove('live');
      recognizing.current = false;
      // interimEl.current.remove(); interimEl.current = null; // Needs React adaptation
    };

    recognition.current.onend = () => {
      if (micBtnRef.current) {
        micBtnRef.current.classList.remove('live');
        micBtnRef.current.textContent = "🎤 Start";
      }
      recognizing.current = false;
      // interimEl.current.remove(); interimEl.current = null; // Needs React adaptation
    };

    // Cleanup function
    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
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


  return (
    <>
      <div className="widget-launcher" onClick={openPanel}>
        <div className="pulse"></div><strong>SOS • Voice</strong>
      </div>

      <div className={`panel-wrap ${isOpen ? 'open' : ''}`}>
        <div className="panel">
          <div className="panel-header">
            <div className="brand">
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#87b7ff', boxShadow: '0 0 10px #87b7ff60' }}></span>
              Calm Assist
            </div>
            <button className="close-btn" onClick={closePanel}>✕</button>
          </div>

          <div className="scroll" id="log" role="log" aria-live="polite" aria-atomic="false" ref={logRef}>
            {messages.map((msg, index) => (
              <div key={index} className="row">
                {msg.type === 'text' && <div className={`msg ${msg.who === 'me' ? 'me' : 'bot'}`}>{msg.text}</div>}
                {msg.type === 'actions' && (
                  <div className="action-row">
                    {msg.data.map((action, actionIndex) => (
                      <button key={actionIndex} className="small-btn" onClick={action.onClick}>
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                {msg.type === 'helplines' && (
                  <div className="help-card">
                    <strong>Helplines:</strong>
                    {msg.data.map((it, helplineIndex) => (
                      <div key={helplineIndex} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '8px' }}>
                        <div>{it.number ? `${it.label}: ${msg.digitsSpaced(it.number)}` : `${it.label} (website)`}</div>
                        <button className="small-btn" onClick={() => msg.callHelpline(it)}>
                          {it.number ? 'Call' : 'Open'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {msg.type === 'callLink' && (
                  <div className="action-row">
                    <a className="small-btn" href={msg.href} target="_blank" rel="noopener noreferrer">
                      {msg.label}
                    </a>
                  </div>
                )}
                {msg.type === 'map' && (
                  <div className="help-card">
                    <strong>Your location</strong><br />
                    {msg.addressText && <>{msg.addressText}<br /></>}
                    Coords: {msg.lat.toFixed(5)}, {msg.lon.toFixed(5)}<br />
                    <a href={`https://www.google.com/maps?q=${msg.lat},${msg.lon}`} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
                    <iframe className="map" src={`https://www.google.com/maps?q=${msg.lat},${msg.lon}&z=16&output=embed`} title="Location map"></iframe>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="controls">
            <button className="control-btn mic" ref={micBtnRef} onClick={() => {
              if (!recognition.current) return;

              if (!recognizing.current) {
                recognizing.current = true;
                micBtnRef.current.textContent = "🎤 Listening…";
                micBtnRef.current.classList.add('live');
                recognition.current.start();
                setTimeout(() => {
                  if (recognizing.current) recognition.current.stop();
                }, 8000);
              } else {
                recognition.current.stop();
              }
            }}>🎤 Start</button>
            <button className="control-btn" onClick={doCalm}>Calm me</button>
            <button className="control-btn" onClick={() => askShareLocationFlow()}>Helplines</button>

            <button className="control-btn" onClick={() => {
              if (window._lastPos) return describeAndSpeakFromPosition(window._lastPos);
              askShareLocationFlow("Would you like me to show and say where you are? ");
            }}>Where am I?</button>
            <label className="small-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <input type="checkbox" checked={autoAnnounce} onChange={(e) => setAutoAnnounce(e.target.checked)} /> Auto announce
            </label>

            <select className="select" value={country} onChange={(e) => setCountry(e.target.value)} id="country">
              <option value="MU">🇲🇺 Mauritius</option>
              <option value="IN">🇮🇳 India</option>
              <option value="GB">🇬🇧 UK</option>
              <option value="US">🇺🇸 USA</option>
              <option value="ZA">🇿🇦 South Africa</option>
            </select>
            <input
              className="field"
              placeholder="Type if you prefer…"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleUserText(typedMessage.trim()); setTypedMessage(''); } }}
            />
            <button className="control-btn" onClick={() => { handleUserText(typedMessage.trim()); setTypedMessage(''); }}>Send</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VoiceAidWidget;