import React, { useState } from 'react';
import DestinationCard from './DestinationCard';

const list = [
    { id: 1, name: 'Paris', place: 'France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=60' },
    { id: 2, name: 'Tokyo', place: 'Japan', img: 'https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=1200&q=60' },
    { id: 3, name: 'Bali', place: 'Indonesia', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60' },
    { id: 4, name: 'New York', place: 'USA', img: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=60' },
    { id: 5, name: 'Santorini', place: 'Greece', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60' },
    { id: 6, name: 'Cape Town', place: 'South Africa', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7iWkC0VcoQqBGOu-bTieWxPpdfBsVMXFSkA&s?auto=format&fit=crop&w=1200&q=60' },
];

export default function Destinations() {
    const [q, setQ] = useState('');
    const filtered = list.filter(d => (d.name + ' ' + d.place).toLowerCase().includes(q.toLowerCase()));

    return (
        <section className="my-14">
            <div className="flex flex-wrap items-center gap-4 mb-8">
                <div
                    className="fireship-popular-title-box"
                    style={{
                        background: "linear-gradient(90deg, #fff 60%, #e0f2fe 100%)",
                        borderRadius: "1.2rem",
                        boxShadow: "0 2px 16px 0 rgba(56,189,248,0.08)",
                        padding: "0.6rem 1.4rem",
                        display: "flex",
                        alignItems: "center",
                        fontWeight: 800,
                        fontSize: 20,
                        letterSpacing: 0.5,
                        color: "#22223b",
                        textShadow: "0 2px 8px rgba(56,189,248,0.06)",
                        border: "none",
                        transition: "color 0.2s, background 0.2s",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    <span role="img" aria-label="star" style={{ fontSize: 22, marginRight: 8 }}>🌟</span>
                    <span classNmae="text-black">Popular Places</span>
                </div>
             <input
  value={q}
  onChange={e => setQ(e.target.value)}
  placeholder="Filter by name"
  className="col-span-1 sm:col-span-2 p-3 rounded-lg border border-slate-200 bg-white/90 dark:bg-slate-800/80 text-base focus:ring-2 focus:ring-sky-300 transition text-black"
  style={{
    minWidth: 180,
  }}
/>
                <button
                    onClick={() => setQ('')}
                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-100 font-semibold shadow transition-all duration-150 hover:scale-105 hover:bg-sky-50 hover:border-sky-400 focus:outline-none"
                    style={{
                        transitionProperty: 'transform, background, box-shadow, color',
                        color: "inherit"
                    }}
                >
                    <span className="text-black">Reset</span>
                </button>
                <span className="ml-auto text-sm font-medium text-slate-500 dark:text-slate-300">
                    Tip: Try "Le Morne"
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {filtered.map(d => <DestinationCard key={d.id} d={d} />)}
            </div>
            <style>
                {`
                .fireship-popular-title-box {
                    color: #22223b;
                    background: linear-gradient(90deg, #fff 60%, #e0f2fe 100%);
                }
                @media (prefers-color-scheme: dark) {
                    .fireship-popular-title-box {
                        color: #fff !important;
                        background: linear-gradient(90deg, #22223b 60%, #2563eb 100%);
                        text-shadow: 0 2px 8px rgba(56,189,248,0.13);
                    }
                }
                `}
            </style>
        </section>
    );
}