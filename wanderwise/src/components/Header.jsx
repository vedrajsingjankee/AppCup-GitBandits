import React, { useState, useRef, useEffect } from 'react';

export default function Header() {
  const [isMusicMenuOpen, setIsMusicMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const menuRef = useRef(null);

  // Working ambient travel music tracks from freesound.org
  const musicTracks = [
    { 
      id: 1, 
      name: "Ocean Waves", 
      emoji: "🌊", 
      description: "Relaxing seaside ambiance",
      url: "https://cdn.freesound.org/previews/110/110797_1966184-lq.mp3"
    },
    { 
      id: 2, 
      name: "Forest Sounds", 
      emoji: "🌲", 
      description: "Gentle woodland atmosphere",
      url: "https://cdn.freesound.org/previews/277/277587_5121236-lq.mp3"
    },
    { 
      id: 3, 
      name: "City Ambience", 
      emoji: "🏙️", 
      description: "Vibrant urban environment",
      url: "https://cdn.freesound.org/previews/342/342958_5865500-lq.mp3"
    },
    { 
      id: 4, 
      name: "Mountain Breeze", 
      emoji: "⛰️", 
      description: "Calm highland winds",
      url: "https://cdn.freesound.org/previews/328/328646_5121236-lq.mp3"
    },
    { 
      id: 5, 
      name: "Airport Lounge", 
      emoji: "✈️", 
      description: "Terminal background sounds",
      url: "https://cdn.freesound.org/previews/392/392534_7879355-lq.mp3"
    },
    { 
      id: 6, 
      name: "Tropical Beach", 
      emoji: "🏖️", 
      description: "Paradise coast sounds",
      url: "https://cdn.freesound.org/previews/328/328647_5121236-lq.mp3"
    }
  ];

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMusicMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      
      // Cleanup audio on unmount
      if (audioElement) {
        audioElement.pause();
        audioElement.remove();
      }
    };
  }, [audioElement]);

  const toggleMusicMenu = () => {
    setIsMusicMenuOpen(!isMusicMenuOpen);
  };

  const playTrack = (track) => {
    // If same track and playing, pause it
    if (currentTrack?.id === track.id && isPlaying) {
      if (audioElement) {
        audioElement.pause();
        setIsPlaying(false);
      }
      return;
    }

    // If different track or not playing, start new track
    if (audioElement) {
      audioElement.pause();
      audioElement.remove();
    }

    try {
      // Create new audio element
      const audio = new Audio(track.url);
      audio.loop = true;
      
      // Handle audio events for accessibility
      audio.addEventListener('loadstart', () => {
        console.log(`Loading: ${track.name}`);
      });
      
      audio.addEventListener('canplay', () => {
        console.log(`Can play: ${track.name}`);
      });
      
      audio.addEventListener('play', () => {
        console.log(`Playing: ${track.name}`);
      });
      
      audio.addEventListener('pause', () => {
        console.log(`Paused: ${track.name}`);
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`Error loading ${track.name}:`, e);
        // Show user-friendly error message
      });

      // Play the audio
      audio.play().then(() => {
        setAudioElement(audio);
        setCurrentTrack(track);
        setIsPlaying(true);
      }).catch(e => {
        console.error(`Failed to play ${track.name}:`, e);
        // Handle playback failure
      });
    } catch (e) {
      console.error(`Error creating audio for ${track.name}:`, e);
    }
  };

  const stopMusic = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.remove();
      setAudioElement(null);
    }
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  // Keyboard navigation support
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsMusicMenuOpen(false);
    }
  };

  return (
    <header
      className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl shadow-[0_2px_16px_0_rgba(56,189,248,0.07)] border-b border-slate-200"
      style={{
        WebkitBackdropFilter: "blur(12px)",
        backdropFilter: "blur(12px)",
        transition: "box-shadow 0.2s",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg border border-slate-100 relative">
              <span style={{
                fontSize: 28,
                background: "linear-gradient(90deg,#38bdf8 60%,#ffe066 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 2px #fff)"
              }}>🌍</span>
              {/* Airplane icon */}
              <span style={{
                position: "absolute",
                right: -8,
                top: 2,
                fontSize: 16,
                filter: "drop-shadow(0 0 2px #fff)"
              }}>✈️</span>
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-slate-800 flex items-center gap-1">
                WanderWise
                <span className="text-base animate-bounce">🎈</span>
              </div>
              <div className="text-xs text-slate-500 italic flex items-center gap-1 font-medium">
                Travel made simple
                <span className="ml-1">🏝️</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-base font-semibold text-slate-700">
            <a
              className="hover:text-sky-500 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-sky-50"
              href="#"
            >
              <span role="img" aria-label="explore">🧭</span> Explore
            </a>
            <a
              className="hover:text-sky-500 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-sky-50"
              href="#"
            >
              <span role="img" aria-label="trips">🧳</span> Trips
            </a>
            <a
              className="hover:text-sky-500 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-sky-50"
              href="#"
            >
              <span role="img" aria-label="saved">💾</span> Saved
            </a>
            
            {/* Accessible Music Control */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={toggleMusicMenu}
                onKeyDown={handleKeyDown}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                aria-label={isPlaying ? "Pause ambient travel music" : "Play ambient travel music"}
                aria-expanded={isMusicMenuOpen}
                aria-haspopup="true"
              >
                <span className="text-lg" aria-hidden="true">
                  {isPlaying ? '⏸️' : '🎵'}
                </span>
                <span className="text-sm font-bold">
                  {currentTrack ? currentTrack.emoji : 'Music'}
                </span>
              </button>

              {/* Accessible Music Menu Dropdown */}
              {isMusicMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
                  role="menu"
                  aria-label="Ambient travel music options"
                >
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      🎧 Ambient Travel Music
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Select a soundscape for your journey
                    </p>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto" role="group" aria-label="Music tracks">
                    {musicTracks.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => playTrack(track)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            playTrack(track);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sky-50 transition-colors focus:outline-none focus:bg-sky-100 ${
                          currentTrack?.id === track.id 
                            ? 'bg-blue-50 border-r-4 border-blue-500' 
                            : ''
                        }`}
                        role="menuitem"
                        aria-selected={currentTrack?.id === track.id}
                      >
                        <span className="text-xl" aria-hidden="true">{track.emoji}</span>
                        <div className="flex-1">
                          <div className="font-medium text-slate-700">
                            {track.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {track.description}
                          </div>
                        </div>
                        {currentTrack?.id === track.id && isPlaying && (
                          <span className="flex items-center gap-1 text-blue-500" aria-label="Currently playing">
                            <span className="flex h-2 w-2">
                              <span className="animate-ping absolute h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative h-2 w-2 rounded-full bg-blue-500"></span>
                            </span>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {(currentTrack || isPlaying) && (
                    <div className="p-3 border-t border-slate-100 bg-slate-50">
                      <button
                        onClick={stopMusic}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
                        aria-label="Stop music"
                      >
                        <span aria-hidden="true">⏹️</span>
                        Stop Music
                      </button>
                    </div>
                  )}
                  
                  <div className="p-3 text-xs text-slate-500 border-t border-slate-100 bg-slate-50 text-center">
                    Audio from freesound.org (CC0)
                  </div>
                </div>
              )}
            </div>

            <button
              className="ml-2 px-5 py-2 rounded-full bg-slate-900 text-white shadow-md font-bold transition-all duration-150 hover:scale-105 hover:bg-sky-600 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
              style={{
                boxShadow: "0 2px 12px #38bdf822",
                letterSpacing: 0.2,
              }}
            >
              <span role="img" aria-label="sign in">🌞</span> Sign in
            </button>
          </nav>

          {/* Mobile menu only */}
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <button
                className="p-2 text-2xl text-slate-700 hover:text-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 rounded"
                aria-label="Open menu"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}