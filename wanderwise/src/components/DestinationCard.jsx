import React, {useState} from 'react'

export default function DestinationCard({d}){
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl bg-white/80 dark:bg-black/50 transform transition-all hover:scale-102 tilt" style={{transitionDuration:'220ms'}}>
      <div className="relative h-56 sm:h-64">
        <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute left-4 bottom-4 text-white">
          <div className="text-lg font-bold drop-shadow-md">{d.name}</div>
          <div className="text-sm drop-shadow-md">{d.place}</div>
        </div>
      </div>

      <div className="p-4">
        <div className="text-sm text-slate-600 dark:text-slate-300">Food. Views. Easy fun.</div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={()=>setOpen(true)} className="px-3 py-2 rounded-md border">View</button>
          <button onClick={()=>setSaved(s=>!s)} className={`px-3 py-2 rounded-md ${saved? 'bg-accent text-white':'border'}`}>
            {saved? 'Saved' : 'Save'}
          </button>
          <div className="ml-auto text-sm text-slate-500 dark:text-slate-300">★ 4.7</div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setOpen(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative z-10">
            <button onClick={()=>setOpen(false)} className="absolute right-4 top-4">✕</button>
            <h3 className="text-xl font-bold">{d.name}, {d.place}</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Demo info. Add real details later. Weather, hotels, and local tips go here.</p>
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 rounded-md bg-indigo-600 text-white">Book (demo)</button>
              <button className="px-4 py-2 rounded-md border">Share</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}