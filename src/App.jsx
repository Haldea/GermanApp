import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";

// კომპონენტების იმპორტი
import Card from './components/Card';
import FilterBar from './components/FilterBar';

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyBMi9oH8-aryirYICzU5KbndFX3ks3TAHY",
  authDomain: "germanapp-c2462.firebaseapp.com",
  databaseURL: "https://germanapp-c2462-default-rtdb.firebaseio.com",
  projectId: "germanapp-c2462",
  storageBucket: "germanapp-c2462.firebasestorage.app",
  messagingSenderId: "959594266621",
  appId: "1:959594266621:web:482b85671130b33f7ce394"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function GermanZenMaster() {
  const [syncCode, setSyncCode] = useState(localStorage.getItem('zen_code'));
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('session'); 
  
  // ძირითადი სტეიტები
  const [inputCode, setInputCode] = useState("");
  const [sessionWords, setSessionWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // ფილტრები ლექსიკონისთვის
  const [listBook, setListBook] = useState('ყველა');
  const [listLesson, setListLesson] = useState('ყველა');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState('newest');

  // ფილტრები სესიისთვის
  const [selBook, setSelBook] = useState('ყველა');
  const [selLesson, setSelLesson] = useState('ყველა');
  const [cardLimit, setCardLimit] = useState(20);

  // რედაქტირება და დამატება
  const [newWord, setNewWord] = useState({ de: '', ka: '', gender: '', example: '', book: '', lesson: '' });
  const [editingWord, setEditingWord] = useState(null);

  const genderColors = { m: 'text-blue-500', f: 'text-pink-500', n: 'text-emerald-500', default: 'text-slate-500' };

  useEffect(() => {
    if (syncCode) loadUserData(syncCode);
  }, [syncCode]);

  const loadUserData = async (code) => {
    setLoading(true);
    const userRef = ref(db, `users/${code.toLowerCase()}/words`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      setAllWords(Object.values(snapshot.val()));
    } else {
      const masterSnapshot = await get(ref(db, 'masterList'));
      if (masterSnapshot.exists()) {
        const data = masterSnapshot.val();
        await set(userRef, data);
        setAllWords(Object.values(data));
      }
    }
    setLoading(false);
  };

  const syncToCloud = (updatedWords) => set(ref(db, `users/${syncCode.toLowerCase()}/words`), updatedWords);

  // სესიის დაწყების ლოგიკა
  const startSession = () => {
    const pool = allWords.filter(w => (selBook === 'ყველა' || w.book === selBook) && (selLesson === 'ყველა' || w.lesson === selLesson));
    if (pool.length === 0) return alert("სიტყვები ვერ მოიძებნა!");
    setSessionWords(pool.sort(() => Math.random() - 0.5).slice(0, cardLimit));
    setIsSessionActive(true);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleAddManual = (e) => {
    e.preventDefault();
    if (allWords.some(w => w.de.toLowerCase() === newWord.de.toLowerCase())) {
      alert("⚠️ ეს სიტყვა უკვე არსებობს!"); return;
    }
    const updated = [...allWords, { ...newWord, id: Date.now().toString(), level: 1, timestamp: Date.now(), date: new Date().toLocaleDateString() }];
    setAllWords(updated);
    syncToCloud(updated);
    setNewWord({ de: '', ka: '', gender: '', example: '', book: '', lesson: '' });
    alert("✅ დაემატა!");
  };

  const handleDelete = (id) => {
    if (window.confirm("ნამდვილად გსურთ წაშლა?")) {
      const updated = allWords.filter(w => w.id !== id);
      setAllWords(updated);
      syncToCloud(updated);
    }
  };

  const handleEditClick = (word) => {
    setEditingWord({ ...word });
    setActiveTab('manage');
    window.scrollTo(0,0);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updated = allWords.map(w => w.id === editingWord.id ? editingWord : w);
    setAllWords(updated);
    syncToCloud(updated);
    setEditingWord(null);
    alert("✅ განახლდა!");
  };

  const handleAnswer = (isCorrect) => {
    const updated = [...allWords];
    const idx = updated.findIndex(w => w.id === sessionWords[currentIndex].id);
    updated[idx].level = isCorrect ? Math.min((updated[idx].level || 1) + 1, 3) : 1;
    setAllWords(updated);
    syncToCloud(updated);
    if (currentIndex < sessionWords.length - 1) { setCurrentIndex(c => c + 1); setIsFlipped(false); }
    else { setIsSessionActive(false); alert("🏁 სესია დასრულდა!"); }
  };

  const books = ['ყველა', ...new Set(allWords.map(w => w.book))];
  const getLessons = (book) => ['ყველა', ...new Set(allWords.filter(w => book === 'ყველა' || w.book === book).map(w => w.lesson))];
  
  const filteredList = useMemo(() => {
    let list = allWords.filter(w => {
      const matchesSearch = w.de?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            w.ka?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBook = listBook === 'ყველა' || w.book === listBook;
      const matchesLesson = listLesson === 'ყველა' || w.lesson === listLesson;
      return matchesSearch && matchesBook && matchesLesson;
    });
    if (sortBy === 'newest') list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    if (sortBy === 'oldest') list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    if (sortBy === 'az') list.sort((a, b) => a.de.localeCompare(b.de));
    return list;
  }, [allWords, searchTerm, listBook, listLesson, sortBy]);

  // შესვლის ეკრანი
  if (!syncCode) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-['Inter']">
        <h1 className="text-3xl font-black mb-8 text-slate-900 uppercase tracking-tighter">გერმანული ზენი</h1>
        <form onSubmit={(e) => { e.preventDefault(); setSyncCode(inputCode.toLowerCase()); localStorage.setItem('zen_code', inputCode.toLowerCase()); }} 
              className="bg-white p-10 rounded-[32px] shadow-xl shadow-slate-200 w-full max-w-sm text-center border border-slate-100">
          <p className="text-slate-400 text-sm mb-6">შეიყვანეთ თქვენი წვდომის კოდი</p>
          <input 
            placeholder="მაგ: zen ან ichliebedich" 
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-4 outline-none focus:ring-2 ring-blue-500/20 text-center font-bold"
            onChange={e => setInputCode(e.target.value)} 
          />
          <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">შესვლა</button>
        </form>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 animate-pulse font-bold">მონაცემები იტვირთება...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-['Inter'] text-slate-800">
      <h1 className="text-3xl font-black mb-10 tracking-tight uppercase">გერმანული ზენი</h1>
      
      {/* ტაბები */}
      {!isSessionActive && (
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 mb-10">
          {['session', 'manage', 'list'].map((tab) => (
            <button
              key={tab}
              onClick={() => {setActiveTab(tab); setEditingWord(null);}}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'session' ? 'სესია' : tab === 'manage' ? 'მართვა' : `ლექსიკონი (${allWords.length})`}
            </button>
          ))}
        </div>
      )}

      {/* კონტენტი */}
      {isSessionActive ? (
        <Card 
          card={sessionWords[currentIndex]}
          isFlipped={isFlipped}
          setIsFlipped={setIsFlipped}
          handleAnswer={handleAnswer}
          onCancel={() => setIsSessionActive(false)}
          total={sessionWords.length}
          current={currentIndex + 1}
        />
      ) : (
        <>
          {activeTab === 'session' && (
            <FilterBar 
              books={books}
              lessons={getLessons(selBook)}
              selBook={selBook}
              setSelBook={setSelBook}
              selLesson={selLesson}
              setSelLesson={setSelLesson}
              cardLimit={cardLimit}
              setCardLimit={setCardLimit}
              onStart={startSession}
            />
          )}

          {activeTab === 'manage' && (
            <div className="bg-white p-8 rounded-[30px] w-full max-w-[450px] shadow-sm border border-slate-100">
              <h4 className="text-xl font-bold mb-6">{editingWord ? "✍️ რედაქტირება" : "➕ ახალი სიტყვა"}</h4>
              <form onSubmit={editingWord ? handleSaveEdit : handleAddManual} className="space-y-4">
                <input placeholder="გერმანული" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" value={editingWord ? editingWord.de : newWord.de} onChange={e => editingWord ? setEditingWord({...editingWord, de: e.target.value}) : setNewWord({...newWord, de: e.target.value})} required />
                <input placeholder="ქართული" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" value={editingWord ? editingWord.ka : newWord.ka} onChange={e => editingWord ? setEditingWord({...editingWord, ka: e.target.value}) : setNewWord({...newWord, ka: e.target.value})} required />
                <div className="flex gap-4">
                  <input placeholder="სქესი (m/f/n)" className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl" value={editingWord ? editingWord.gender : newWord.gender} onChange={e => editingWord ? setEditingWord({...editingWord, gender: e.target.value}) : setNewWord({...newWord, gender: e.target.value})} />
                  <input placeholder="გაკვეთილი" className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl" value={editingWord ? editingWord.lesson : newWord.lesson} onChange={e => editingWord ? setEditingWord({...editingWord, lesson: e.target.value}) : setNewWord({...newWord, lesson: e.target.value})} />
                </div>
                <input placeholder="წიგნი" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl" value={editingWord ? editingWord.book : newWord.book} onChange={e => editingWord ? setEditingWord({...editingWord, book: e.target.value}) : setNewWord({...newWord, book: e.target.value})} />
                <textarea placeholder="მაგალითი..." className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl h-24 resize-none" value={editingWord ? editingWord.example : newWord.example} onChange={e => editingWord ? setEditingWord({...editingWord, example: e.target.value}) : setNewWord({...newWord, example: e.target.value})} />
                <button type="submit" className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all">
                  {editingWord ? "განახლება" : "დამატება"}
                </button>
                {editingWord && <button type="button" onClick={() => setEditingWord(null)} className="w-full py-2 text-slate-400 text-sm">გაუქმება</button>}
              </form>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="w-full max-w-3xl bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
              <input placeholder="🔍 ძებნა (DE ან KA)..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6 outline-none focus:ring-2 ring-blue-500/20" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <div className="grid grid-cols-2 gap-4 mb-6">
                <select value={listBook} onChange={e => {setListBook(e.target.value); setListLesson('ყველა');}} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none">
                  {books.map(b => <option key={b} value={b}>{b === 'ყველა' ? 'ყველა წიგნი' : b}</option>)}
                </select>
                <select value={listLesson} onChange={e => setListLesson(e.target.value)} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none">
                  {getLessons(listBook).map(l => <option key={l} value={l}>{l === 'ყველა' ? 'ყველა გაკვეთილი' : `გაკვეთილი ${l}`}</option>)}
                </select>
              </div>
              <div className="flex justify-between items-center mb-6 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>ნაპოვნია: {filteredList.length}</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent text-blue-500 outline-none cursor-pointer">
                  <option value="newest">უახლესი</option>
                  <option value="oldest">უძველესი</option>
                  <option value="az">A-Z</option>
                </select>
              </div>
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2">
                {filteredList.map(w => (
                  <div key={w.id} className="flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group">
                    <div>
                      <div className={`font-bold text-lg ${genderColors[w.gender] || genderColors.default}`}>{w.de}</div>
                      <div className="text-slate-500 text-sm">{w.ka} <span className="opacity-40 text-[10px] ml-2">{w.date}</span></div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(w)} className="p-2 bg-white rounded-lg shadow-sm hover:scale-110 transition-transform">✏️</button>
                      <button onClick={() => handleDelete(w.id)} className="p-2 bg-white rounded-lg shadow-sm text-red-500 hover:scale-110 transition-transform">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-10 text-slate-300 hover:text-slate-500 text-[10px] uppercase tracking-widest transition-colors">
        გამოსვლა (კოდი: {syncCode})
      </button>
    </div>
  );
}