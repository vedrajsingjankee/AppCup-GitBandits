import React, { useState } from 'react';
import Chatbot from './Chatbot';

export default function Hero() {
  const [q, setQ] = useState('');

  return (
    <section className="my-8">
      <div className="card-glass p-6 md:p-10 bg-white/70 dark:bg-black/50">
        <div className="md:flex md:items-center md:justify-between gap-6">
          <div className="md:flex-1">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Wander.
              <span className="text-accent"> Wise</span>
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-xl">Plan trips fast. See pretty places. Save favorites. Play with the UI. Tap random to spark ideas.</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full px-3 py-1 bg-indigoglass/10 text-xs font-semibold">Curated trips</div>
              <div className="rounded-full px-3 py-1 bg-skysoft/10 text-xs font-semibold">Local tips</div>
              <div className="rounded-full px-3 py-1 bg-accent/10 text-xs font-semibold">Smart guide (soon)</div>
            </div>
          </div>

          <div className="mt-6 md:mt-0 md:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 hero-grid">
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search city or country" className="col-span-1 sm:col-span-2 p-3 rounded-lg border border-white/30 dark:border-black/30 bg-white/80 dark:bg-black/40" />
              <input placeholder="Date" className="col-span-1 p-3 rounded-lg border border-white/30 dark:border-black/30 bg-white/80 dark:bg-black/40" />
              <select className="col-span-1 p-3 rounded-lg border border-white/30 dark:border-black/30 bg-white/80 dark:bg-black/40">
                <option>2 people</option>
                <option>1 person</option>
                <option>4 people</option>
              </select>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => alert('UI only')} className="px-6 py-3 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 text-white font-medium shadow-lg transform hover:-translate-y-0.5 transition">Search</button>
              <button onClick={() => { setQ('') }} className="px-4 py-3 rounded-lg border">Clear</button>
              <div className="ml-auto text-sm text-slate-500 dark:text-slate-300">Tip: try "Lisbon"</div>
            </div>

            <div className="mt-4 flex gap-3 items-center">
              <div className="w-28 h-16 rounded-lg bg-gradient-to-br from-indigo-200 to-teal-200 flex items-center justify-center text-sm font-semibold shadow-md animate-float tilt">Surfer beach</div>
              <div className="w-28 h-16 rounded-lg bg-gradient-to-br from-pink-200 to-amber-200 flex items-center justify-center text-sm font-semibold shadow-md animate-float tilt">City break</div>
              <div className="w-28 h-16 rounded-lg bg-gradient-to-br from-emerald-200 to-sky-200 flex items-center justify-center text-sm font-semibold shadow-md animate-float tilt">Nature</div>
            </div>
          </div>
        </div>
      </div>
      <Chatbot />
    </section>
  );
}