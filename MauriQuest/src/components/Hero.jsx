import React, { useState } from 'react';

export default function Hero() {
  const [q, setQ] = useState('');

  return (
    <section className="my-10">
      <div
        className="rounded-3xl shadow-2xl bg-white/90 dark:bg-slate-900/80 px-8 py-10 relative overflow-hidden"
        style={{
          border: 'none',
          boxShadow: '0 8px 32px 0 rgba(30,41,59,0.10), 0 1.5px 8px 0 rgba(56,189,248,0.10)',
          position: 'relative',
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
            opacity: 0.10,
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
            opacity: 0.08,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <div className="md:flex md:items-center md:justify-between gap-8 relative z-10">
          <div className="md:flex-1">
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-2">
               <span className="text-black">Mauri.</span><span className="text-sky-500">Quest</span>
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-xl text-lg font-medium">
              Plan trips fast. Discover beautiful places. Save favorites. Play with the UI. Tap random to spark ideas.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full px-3 py-1 bg-sky-100 text-xs font-semibold text-sky-700 shadow-sm">Curated trips</span>
              <span className="rounded-full px-3 py-1 bg-indigo-100 text-xs font-semibold text-indigo-700 shadow-sm">Local tips</span>
              <span className="rounded-full px-3 py-1 bg-yellow-100 text-xs font-semibold text-yellow-700 shadow-sm">Smart guide (soon)</span>
            </div>
          </div>

          <div className="mt-8 md:mt-0 md:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search city or country"
                 className="col-span-1 sm:col-span-2 p-3 rounded-lg border border-slate-200 bg-white/90 dark:bg-slate-800/80 text-base focus:ring-2 focus:ring-sky-300 transition text-black"
              />
              <input
                placeholder="Date"
 className="col-span-1 sm:col-span-2 p-3 rounded-lg border border-slate-200 bg-white/90 dark:bg-slate-800/80 text-base focus:ring-2 focus:ring-sky-300 transition text-black"
              />
              <select  className="col-span-1 sm:col-span-2 p-3 rounded-lg border border-slate-200 bg-white/90 dark:bg-slate-800/80 text-base focus:ring-2 focus:ring-sky-300 transition text-black">
                <option>2 people</option>
                <option>1 person</option>
                <option>4 people</option>
              </select>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => alert('UI only')}
                className="px-7 py-3 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white font-bold shadow-lg transition-all duration-150 hover:scale-105 hover:shadow-xl focus:outline-none"
                style={{
                  transitionProperty: 'transform, box-shadow, background',
                }}
              >
                Search
              </button>
              <button
                onClick={() => { setQ('') }}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-slate-700 font-semibold shadow transition-all duration-150 hover:scale-105 hover:bg-sky-50 focus:outline-none"
                style={{
                  transitionProperty: 'transform, background, box-shadow',
                }}
              >
                Clear
              </button>
              <div className="ml-auto text-sm text-slate-500 dark:text-slate-300 font-medium">Tip: try "Lisbon"</div>
            </div>

            <div className="mt-6 flex gap-4 items-center">
              <div className="w-28 h-16 rounded-xl bg-gradient-to-br from-sky-200 to-teal-200 flex items-center justify-center text-base font-semibold shadow-md transition-transform duration-300 hover:scale-105 hover:rotate-1" style={{ willChange: 'transform' }}>
                <span className="text-black">Surfer Beach</span>
              </div>
              <div className="w-28 h-16 rounded-xl bg-gradient-to-br from-pink-200 to-amber-200 flex items-center justify-center text-base font-semibold shadow-md transition-transform duration-300 hover:scale-105 hover:-rotate-1" style={{ willChange: 'transform' }}>
                <span className="text-black">City Tour</span>
              </div>
              <div className="w-28 h-16 rounded-xl bg-gradient-to-br from-emerald-200 to-sky-200 flex items-center justify-center text-base font-semibold shadow-md transition-transform duration-300 hover:scale-105 hover:rotate-2" style={{ willChange: 'transform' }}>
                <span className="text-black">Nature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}