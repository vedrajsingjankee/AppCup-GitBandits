import React, { useState, useRef, useEffect } from 'react';

const ASLDemo = () => {
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [cachedPhrases, setCachedPhrases] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [stopRequested, setStopRequested] = useState(false);
  const [spokenOnceForThisVideo, setSpokenOnceForThisVideo] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [processStatus, setProcessStatus] = useState('');
  const [processStatusClass, setProcessStatusClass] = useState('muted');
  const [showVideo, setShowVideo] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  const videoInputRef = useRef(null);
  const previewRef = useRef(null);
  const REQUIRED_ENDING = "You good?";
  const GAP_MS = 2500;

  // Use environment variable or default
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';

  const setStatus = (text, cls = "muted") => {
    setProcessStatus(text);
    setProcessStatusClass(cls);
  };

  const renderSubtitles = (phrases) => {
    setCachedPhrases(phrases);
    setShowResult(true);
  };

  const speakPhrases = async (phrases, delayMs = GAP_MS) => {
    if (!("speechSynthesis" in window)) {
      setStatus("SpeechSynthesis not supported in this browser.", "muted err");
      return;
    }

    // Ensure we ALWAYS end with "You good?"
    let finalPhrases = [...phrases];
    if (!finalPhrases.length || finalPhrases[finalPhrases.length - 1] !== REQUIRED_ENDING) {
      finalPhrases = [...finalPhrases.filter(Boolean), REQUIRED_ENDING];
      renderSubtitles(finalPhrases);
    }

    setSpeaking(true);
    setStopRequested(false);

    // Initial wait before the very first word
    await new Promise(r => setTimeout(r, delayMs));

    for (let i = 0; i < finalPhrases.length; i++) {
      if (stopRequested) break;

      const phrase = finalPhrases[i];
      
      await new Promise((resolve, reject) => {
        const utter = new SpeechSynthesisUtterance(phrase);
        utter.rate = 1.0;
        utter.pitch = 1.0;
        utter.onstart = () => setStatus(`Speaking: "${phrase}"`, "muted ok");
        utter.onend = resolve;
        utter.onerror = reject;
        window.speechSynthesis.speak(utter);
      }).catch(() => {});

      if (stopRequested) break;

      // pause between phrases (skip after the last one)
      if (i < finalPhrases.length - 1) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    setSpeaking(false);
    setStatus(stopRequested ? "Stopped." : "Done.");
  };

  const fetchDemoPhrases = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/demo-asl`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("Demo processing failed.");
      return data.subtitles || [];
    } catch (error) {
      console.error("Error fetching demo phrases:", error);
      throw error;
    }
  };

  const ensurePhrasesReady = async () => {
    if (!cachedPhrases) {
      setStatus("Loading AI subtitles…");
      try {
        const raw = await fetchDemoPhrases();
        // Ensure ending now as well (so chips match exactly what will be spoken)
        const processedPhrases = raw.length && raw[raw.length - 1] === REQUIRED_ENDING
          ? raw
          : [...raw.filter(Boolean), REQUIRED_ENDING];

        renderSubtitles(processedPhrases);
        setStatus("Ready.");
        return processedPhrases;
      } catch (error) {
        setStatus("Failed to load subtitles.", "muted err");
        throw error;
      }
    }
    return cachedPhrases;
  };

  const handleUpload = async () => {
    if (!videoInputRef.current?.files?.length) {
      setUploadStatus("Choose a video first.");
      return;
    }
    
    setUploadStatus("Uploading…");

    try {
      const fd = new FormData();
      fd.append("video", videoInputRef.current.files[0]);
      
      const res = await fetch(`${API_BASE_URL}/api/upload-asl`, { 
        method: "POST", 
        body: fd 
      });
      
      // Check if response is OK before parsing JSON
      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");

      setUploadedFileUrl(data.file?.url || null);
      setUploadStatus("Uploaded ✔");

      if (data.file?.url) {
        setShowVideo(true);
        setSpokenOnceForThisVideo(false);

        // Preload phrases so we can speak at play-start
        await ensurePhrasesReady();

        // Start video (Upload click = user gesture → allows autoplay & TTS)
        if (previewRef.current) {
          previewRef.current.src = `${API_BASE_URL}${data.file.url}`;
          const playPromise = previewRef.current.play();
          if (playPromise?.catch) await playPromise.catch(() => {});
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("Upload error: " + err.message);
    }
  };

  const handlePlay = async () => {
    if (spokenOnceForThisVideo) return;
    setSpokenOnceForThisVideo(true);
    
    try {
      const phrases = await ensurePhrasesReady();
      speakPhrases(phrases, GAP_MS);
    } catch (e) {
      console.error(e);
      setStatus("Failed to start speech.", "muted err");
    }
  };

  const handlePause = () => {
    if (previewRef.current?.ended) return;
    if (speaking) {
      setStopRequested(true);
      window.speechSynthesis.cancel();
      setStatus("Paused.");
    }
  };

  const handleStop = () => {
    setStopRequested(true);
    window.speechSynthesis.cancel();
    setStatus("Stopped.");
    setSpeaking(false);
  };

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speaking]);

  return (
    <div className="wrap">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            ASL → "AI" Speech
          </h1>
          <p className="text-slate-400 text-lg">Transform sign language videos into spoken words</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="card bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="text-blue-400 text-xl">1</span>
              </div>
              <h2 className="text-xl font-bold text-white">Upload ASL Video</h2>
            </div>
            
            <div className="space-y-4">
              <input 
                ref={videoInputRef}
                type="file" 
                accept="video/*" 
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-all"
              />
              <button 
                className="w-full btn bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                onClick={handleUpload}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>📤</span> Upload Video
                </span>
              </button>
              <div className="text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${processStatusClass}`}>
                  {uploadStatus}
                </span>
              </div>
            </div>

            {showVideo && (
              <div className="mt-6 p-4 bg-black/30 rounded-xl">
                <video 
                  ref={previewRef}
                  controls 
                  playsInline
                  onPlay={handlePlay}
                  onPause={handlePause}
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="card bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <span className="text-cyan-400 text-xl">2</span>
              </div>
              <h2 className="text-xl font-bold text-white">Speech Status</h2>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button 
                className="btn bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!speaking}
                onClick={handleStop}
              >
                <span className="flex items-center gap-2">
                  <span>⏹️</span> Stop Voice
                </span>
              </button>
              <div className="flex-1 min-w-[200px]">
                <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium w-full text-center ${processStatusClass}`}>
                  {processStatus || "Ready to process"}
                </span>
              </div>
            </div>

            {showResult && cachedPhrases && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>🗨️</span> Recognized Subtitles
                </h3>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 bg-slate-800/30 rounded-xl">
                  {cachedPhrases.map((phrase, i) => (
                    <span 
                      key={i}
                      className={`subtitle-chip inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        !stopRequested && speaking 
                          ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20 scale-105' 
                          : 'bg-slate-700/50 border border-slate-600/50 text-slate-300'
                      }`}
                      data-idx={i}
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
              <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                <span>ℹ️</span> How it works
              </h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Upload an ASL video file</li>
                <li>• System analyzes signs in real-time</li>
                <li>• Converts signs to spoken phrases</li>
                <li>• Automatically plays audio output</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        body { 
          margin:0; 
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; 
          background: linear-gradient(135deg, #0f172a 0%, #0a0f1d 100%);
          color:#e8ecf1; 
          min-height: 100vh;
        }
        .wrap { 
          padding: 2rem; 
        }
        .muted { 
          opacity:.85; 
          font-size:.92rem; 
        }
        .ok { 
          color:#9ff8cf; 
        }
        .err { 
          color:#ff8a8a; 
        }
        @media (max-width: 768px) {
          .wrap { padding: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default ASLDemo;