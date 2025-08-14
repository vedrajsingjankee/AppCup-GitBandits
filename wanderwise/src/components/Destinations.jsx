import React, {useState} from 'react'
import DestinationCard from './DestinationCard'

const list = [
    {id:1, name:'Paris', place:'France', img:'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=60'},
  {id:2, name:'Tokyo', place:'Japan', img:'https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=1200&q=60'},
  {id:3, name:'Bali', place:'Indonesia', img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60'},
  {id:4, name:'New York', place:'USA', img:'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=60'},
  {id:5, name:'Santorini', place:'Greece', img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60'},
  {id:6, name:'Cape Town', place:'South Africa', img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7iWkC0VcoQqBGOu-bTieWxPpdfBsVMXFSkA&s?auto=format&fit=crop&w=1200&q=60'},
]

export default function Destinations(){
  const [q, setQ] = useState('')
  const filtered = list.filter(d=> (d.name + ' ' + d.place).toLowerCase().includes(q.toLowerCase()))

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Popular places</h2>
        <div className="flex items-center gap-3">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Filter" className="p-2 rounded-md border" />
          <button onClick={()=>{setQ('')}} className="px-3 py-2 rounded-md border">Reset</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(d=> <DestinationCard key={d.id} d={d} />)}
      </div>
    </section>
  )
}