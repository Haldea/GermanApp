import React from 'react';

export default function WordList({ 
  searchTerm, setSearchTerm, listBook, setListBook, listLesson, setListLesson, 
  books, getLessons, filteredList, handleEditClick, handleDelete, genderColors 
}) {
  return (
    <div className="w-full max-w-3xl bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      {/* ძებნა */}
      <input 
        placeholder="🔍 ძებნა (DE ან KA)..." 
        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6 outline-none focus:ring-2 ring-blue-500/20"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {/* ფილტრები */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <select 
          value={listBook} 
          onChange={e => setListBook(e.target.value)} 
          className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
        >
          {books.map(b => <option key={b} value={b}>{b === 'ყველა' ? 'ყველა წიგნი' : b}</option>)}
        </select>
        <select 
          value={listLesson} 
          onChange={e => setListLesson(e.target.value)} 
          className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
        >
          {getLessons(listBook).map(l => <option key={l} value={l}>{l === 'ყველა' ? 'ყველა გაკვეთილი' : `გაკვეთილი ${l}`}</option>)}
        </select>
      </div>

      {/* სიის თავი */}
      <div className="flex justify-between items-center mb-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <span>ნაპოვნია: {filteredList.length}</span>
      </div>

      {/* თავად სია */}
      <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredList.map(w => (
          <div key={w.id} className="flex justify-between items-center p-4 mb-2 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors group">
            <div className="flex-1">
              <div className={`font-bold text-lg ${genderColors[w.gender] || 'text-slate-800'}`}>{w.de}</div>
              <div className="text-slate-500 text-sm">{w.ka}</div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEditClick(w)} className="p-2 hover:bg-white rounded-lg shadow-sm transition-all">✏️</button>
              <button onClick={() => handleDelete(w.id)} className="p-2 hover:bg-white rounded-lg shadow-sm text-red-500 transition-all">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}