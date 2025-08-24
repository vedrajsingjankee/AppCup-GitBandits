import React, { useState } from 'react';

export default function DestinationCard({ d }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-xl bg-white/90 dark:bg-slate-900/80 group"
      style={{
        border: 'none',
        position: 'relative',
        transform: hovered
          ? 'scale(1.045) translateY(-8px)'
          : 'scale(1) translateY(0)',
        boxShadow: hovered
          ? '0 16px 48px 0 rgba(56,189,248,0.22), 0 4px 24px 0 rgba(30,41,59,0.13)'
          : '0 4px 20px 0 rgba(56,189,248,0.09), 0 1.5px 8px 0 rgba(30,41,59,0.07)',
        willChange: 'transform, box-shadow',
        transition: 'transform 0.33s cubic-bezier(.4,2,.6,1), box-shadow 0.33s cubic-bezier(.4,2,.6,1)',
        zIndex: hovered ? 2 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-56 sm:h-64">
        <img
          src={d.img}
          alt={d.name}
          className="w-full h-full object-cover"
          style={{
            filter: hovered
              ? 'brightness(1.03) saturate(1.12) blur(0.5px)'
              : 'brightness(0.97) saturate(1.08)',
            transition: 'filter 0.33s cubic-bezier(.4,2,.6,1)',
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
          style={{
            transition: 'background 0.33s cubic-bezier(.4,2,.6,1), opacity 0.33s cubic-bezier(.4,2,.6,1)',
            opacity: hovered ? 0.82 : 1,
          }}
        />
        <div className="absolute left-5 bottom-5 text-white z-10">
          <div className="text-xl font-extrabold drop-shadow-lg tracking-tight">{d.name}</div>
          <div className="text-sm drop-shadow-md font-medium opacity-90">{d.place}</div>
        </div>
        {/* Subtle floating accent */}
        <div
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 90,
            height: 90,
            background: "radial-gradient(circle at 40% 60%, #38bdf8 0%, transparent 70%)",
            opacity: hovered ? 0.18 : 0.10,
            zIndex: 0,
            pointerEvents: "none",
            transition: "opacity 0.33s cubic-bezier(.4,2,.6,1)",
          }}
        />
      </div>

      <div className="p-5">
        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300 font-semibold mb-2">
          Food • Views • Fun
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white font-semibold shadow transition-all duration-200 hover:scale-105 hover:bg-sky-600 focus:outline-none"
            style={{
              transition: 'transform 0.22s cubic-bezier(.4,2,.6,1), background 0.22s, box-shadow 0.22s',
              boxShadow: '0 2px 8px #2563eb22',
            }}
          >
            View
          </button>
          <button
            onClick={() => setSaved(s => !s)}
            className={`px-3 py-2 rounded-lg font-semibold focus:outline-none ${
              saved
                ? 'bg-yellow-400 text-slate-900 shadow'
                : 'bg-white/80 text-slate-700 border border-slate-200 hover:bg-yellow-100 hover:text-yellow-700'
            }`}
            style={{
              transition: 'transform 0.22s cubic-bezier(.4,2,.6,1), background 0.22s, color 0.22s, box-shadow 0.22s',
              boxShadow: saved ? '0 2px 8px #ffe06655' : undefined,
              transform: saved ? 'scale(1.05)' : undefined,
            }}
          >
            {saved ? '★ Saved' : '☆ Save'}
          </button>
          <div className="ml-auto text-sm text-slate-500 dark:text-slate-300 font-semibold flex items-center gap-1">
            <span style={{ color: '#f59e42', fontSize: 16 }}>★</span> 4.7
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            style={{ transition: 'background 0.2s' }}
          ></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-7 relative z-10 animate-fadeInUp"
            style={{
              animation: 'fadeInUp 0.5s cubic-bezier(.4,2,.6,1)',
              transition: 'box-shadow 0.3s cubic-bezier(.4,2,.6,1), background 0.3s cubic-bezier(.4,2,.6,1)'
            }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 text-2xl text-slate-400 hover:text-sky-500 transition-colors font-bold"
              aria-label="Close"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s cubic-bezier(.4,2,.6,1), transform 0.2s cubic-bezier(.4,2,.6,1)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.18)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              ×
            </button>
            <h3 className="text-2xl font-extrabold mb-2 text-slate-900 dark:text-white tracking-tight">
              {d.name}, <span className="font-semibold text-sky-500">{d.place}</span>
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              Demo info. Add real details later. Weather, hotels, and local tips go here.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-bold shadow transition-all duration-200 hover:scale-105 hover:bg-indigo-700 focus:outline-none"
                style={{
                  transition: 'transform 0.22s cubic-bezier(.4,2,.6,1), background 0.22s, box-shadow 0.22s',
                  boxShadow: '0 2px 8px #6366f155',
                }}
              >
                Book (demo)
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-white/90 text-slate-700 border border-slate-200 font-semibold shadow transition-all duration-200 hover:scale-105 hover:bg-sky-50 hover:border-sky-400 focus:outline-none"
                style={{
                  transition: 'transform 0.22s cubic-bezier(.4,2,.6,1), background 0.22s, border 0.22s, box-shadow 0.22s',
                  boxShadow: '0 2px 8px #38bdf822',
                }}
              >
                Share
              </button>
            </div>
          </div>
          <style>
            {`
              @keyframes fadeInUp {
                0% { opacity: 0; transform: translateY(32px);}
                100% { opacity: 1; transform: translateY(0);}
              }
              .animate-fadeInUp {
                animation: fadeInUp 0.5s cubic-bezier(.4,2,.6,1);
              }
            `}
          </style>
        </div>
      )}
    </div>
  );
}