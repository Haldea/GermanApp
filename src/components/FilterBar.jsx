import React from 'react';

export default function FilterBar({ books, lessons, selBook, setSelBook, selLesson, setSelLesson, cardLimit, setCardLimit, onStart }) {
  return (
    <div className="bg-white p-8 rounded-[30px] w-full max-w-[400px] shadow-sm border border-slate-100 text-center">
      <h3 className="text-xl font-bold mb-6 text-slate-800">სესიის მომართვა</h3>
      
      <div className="text-left text-xs font-bold text-slate-400 mb-2 ml-1">წიგნი</div>
      <select 
        value={selBook} 
        onChange={(e) => setSelBook(e.target.value)}
        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4 outline-none focus:ring-2 ring-blue-500/20"
      >
        {books.map(b => <option key={b} value={b}>{b}</option>)}
      </select>

      <div className="text-left text-xs font-bold text-slate-400 mb-2 ml-1">გაკვეთილი</div>
      <select 
        value={selLesson} 
        onChange={(e) => setSelLesson(e.target.value)}
        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl mb-6 outline-none focus:ring-2 ring-blue-500/20"
      >
        {lessons.map(l => <option key={l} value={l}>{l === 'ყველა' ? l : `გაკვეთილი ${l}`}</option>)}
      </select>

      <div className="flex justify-between items-center mb-8 px-1">
        <span className="text-sm text-slate-600 font-medium">რაოდენობა:</span>
        <input 
          type="number" 
          value={cardLimit} 
          onChange={(e) => setCardLimit(e.target.value)}
          className="w-16 p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
        />
      </div>

      <button 
        onClick={onStart}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95"
      >
        დაწყება 🚀
      </button>
    </div>
  );
}