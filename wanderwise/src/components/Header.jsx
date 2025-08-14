import React from 'react'

export default function Header({dark, setDark}){
  return (
    <header className="sticky top-0 z-40 bg-white/40 dark:bg-black/30 backdrop-blur-md border-b border-white/20 dark:border-black/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center text-white font-extrabold animate-pulsefast">W</div>
            <div>
              <div className="font-bold">WanderWise</div>
              <div className="text-xs text-slate-500 dark:text-slate-300">Travel made playful</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700 dark:text-slate-200">
            <a className="hover:underline">Explore</a>
            <a className="hover:underline">Trips</a>
            <a className="hover:underline">Saved</a>
            <button className="ml-2 px-4 py-2 rounded-md bg-accent text-white text-sm">Sign in</button>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={()=>setDark(!dark)} aria-label="toggle theme" className="p-2 rounded-md border dark:border-white/10">
              {dark ? '🌙' : '☀️'}
            </button>
            <div className="md:hidden">
              <button className="p-2">☰</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}