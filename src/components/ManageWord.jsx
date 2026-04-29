import React from 'react';

export default function ManageWord({ editingWord, setEditingWord, newWord, setNewWord, handleSaveEdit, handleAddManual }) {
  const data = editingWord || newWord;
  const setData = editingWord ? setEditingWord : setNewWord;

  const handleChange = (field, val) => setData({ ...data, [field]: val });

  return (
    <div className="bg-white p-8 rounded-[30px] w-full max-w-[450px] shadow-sm border border-slate-100">
      <h4 className="text-xl font-bold mb-6 text-slate-800">
        {editingWord ? "✍️ რედაქტირება" : "➕ ახალი სიტყვა"}
      </h4>
      <form onSubmit={editingWord ? handleSaveEdit : handleAddManual} className="space-y-4">
        <input 
          placeholder="გერმანული" 
          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 ring-emerald-500/20"
          value={data.de} 
          onChange={e => handleChange('de', e.target.value)} required 
        />
        <input 
          placeholder="ქართული" 
          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 ring-emerald-500/20"
          value={data.ka} 
          onChange={e => handleChange('ka', e.target.value)} required 
        />
        <div className="flex gap-4">
          <input 
            placeholder="სქესი (m/f/n)" 
            className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
            value={data.gender} 
            onChange={e => handleChange('gender', e.target.value)} 
          />
          <input 
            placeholder="გაკვეთილი" 
            className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
            value={data.lesson} 
            onChange={e => handleChange('lesson', e.target.value)} 
          />
        </div>
        <input 
          placeholder="წიგნი (მაგ: A1.1)" 
          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
          value={data.book} 
          onChange={e => handleChange('book', e.target.value)} 
        />
        <textarea 
          placeholder="მაგალითი..." 
          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl h-24 outline-none resize-none"
          value={data.example} 
          onChange={e => handleChange('example', e.target.value)} 
        />
        <button type="submit" className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all active:scale-95">
          {editingWord ? "განახლება" : "დამატება"}
        </button>
        {editingWord && (
          <button 
            type="button" 
            onClick={() => setEditingWord(null)} 
            className="w-full py-2 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
          >
            გაუქმება
          </button>
        )}
      </form>
    </div>
  );
}