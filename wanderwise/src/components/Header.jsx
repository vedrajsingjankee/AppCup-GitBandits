import React from 'react';

export default function Header() {
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
            <button
              className="ml-2 px-5 py-2 rounded-full bg-slate-900 text-white shadow-md font-bold transition-all duration-150 hover:scale-105 hover:bg-sky-600 flex items-center gap-2"
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
                className="p-2 text-2xl text-slate-700 hover:text-sky-500 transition-colors"
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