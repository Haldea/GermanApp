import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";

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

const STYLES = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafb', fontFamily: '"Inter", "BPG NPP Modern", sans-serif', padding: '40px 20px', color: '#1e293b' },
  card: { width: '450px', height: '450px', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', textAlign: 'center', padding: '40px', transition: 'transform 0.2s ease', lineHeight: '1.4', userSelect: 'none' },
  genderColors: { m: '#3b82f6', f: '#ec4899', n: '#10b981', default: '#64748b' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '100%', marginBottom: '10px', fontSize: '14px' },
  btn: { padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: '0.2s' },
  tabBar: { display: 'flex', gap: '10px', marginBottom: '30px', background: '#fff', padding: '8px', borderRadius: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  tab: (active) => ({ padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', backgroundColor: active ? '#1e293b' : 'transparent', color: active ? '#fff' : '#64748b', fontWeight: 'bold', border: 'none' }),
  wordList: { width: '100%', maxWidth: '800px', background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  wordRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9' },
  filterGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }
};

export default function GermanZenMaster() {
  const [syncCode, setSyncCode] = useState(localStorage.getItem('zen_code'));
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('session'); 
  
  // States
  const [inputCode, setInputCode] = useState("");
  const [sessionWords, setSessionWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Filters for Dictionary Tab
  const [listBook, setListBook] = useState('ყველა');
  const [listLesson, setListLesson] = useState('ყველა');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, az

  // Filters for Session Tab
  const [selBook, setSelBook] = useState('ყველა');
  const [selLesson, setSelLesson] = useState('ყველა');
  const [cardLimit, setCardLimit] = useState(20);

  // Entry & Edit
  const [newWord, setNewWord] = useState({ de: '', ka: '', gender: '', example: '', book: '', lesson: '' });
  const [editingWord, setEditingWord] = useState(null);

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

  const handleAddManual = (e) => {
    e.preventDefault();
    if (allWords.some(w => w.de.toLowerCase() === newWord.de.toLowerCase())) {
      alert("⚠️ ეს სიტყვა უკვე არსებობს!"); return;
    }
    // დამატებისას ვიყენებთ Timestamp-ს სორტირებისთვის
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

  // დათვლილი ფილტრები
  const books = ['ყველა', ...new Set(allWords.map(w => w.book))];
  const getLessons = (book) => ['ყველა', ...new Set(allWords.filter(w => book === 'ყველა' || w.book === book).map(w => w.lesson))];
  
  // ლექსიკონის ფილტრაციის და სორტირების ლოგიკა
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

  if (!syncCode) {
    return (
      <div style={STYLES.container}>
        <h1>გერმანული ზენი</h1>
        <form onSubmit={(e) => { e.preventDefault(); setSyncCode(inputCode.toLowerCase()); localStorage.setItem('zen_code', inputCode.toLowerCase()); }} style={{background: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}}>
          <input placeholder="შეიყვანეთ კოდი" style={STYLES.input} onChange={e => setInputCode(e.target.value)} />
          <button type="submit" style={{...STYLES.btn, background: '#1e293b', color: '#fff', width: '100%'}}>შესვლა</button>
        </form>
      </div>
    );
  }

  if (loading) return <div style={STYLES.container}>იტვირთება...</div>;

  if (isSessionActive) {
    const card = sessionWords[currentIndex];
    return (
      <div style={STYLES.container}>
        <div style={{width: '450px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#94a3b8', fontSize: '13px'}}>
          <button onClick={() => setIsSessionActive(false)} style={{background:'none', border:'none', cursor:'pointer'}}>✕ გაუქმება</button>
          <span>{currentIndex + 1} / {sessionWords.length}</span>
          <button onClick={() => setIsSessionActive(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#3b82f6'}}>💾 შენახვა</button>
        </div>
        <div onClick={() => setIsFlipped(!isFlipped)} style={{...STYLES.card, backgroundColor: STYLES.genderColors[card.gender] || STYLES.genderColors.default, color: 'white'}}>
          <div style={{fontSize: '13px', opacity: 0.7, marginBottom: '25px'}}>{card.book} | გაკვეთილი {card.lesson}</div>
          <div style={{fontSize: '42px', fontWeight: 'bold'}}>{isFlipped ? card.ka : card.de}</div>
          {isFlipped && card.example && <div style={{marginTop: '35px', fontSize: '18px', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '20px'}}>"{card.example}"</div>}
        </div>
        <div style={{marginTop: '30px', display: 'flex', gap: '20px', width: '450px'}}>
          {isFlipped ? (
            <><button onClick={() => handleAnswer(false)} style={{...STYLES.btn, flex:1, background:'#f87171', color:'white'}}>არ ვიცი</button>
              <button onClick={() => handleAnswer(true)} style={{...STYLES.btn, flex:1, background:'#34d399', color:'white'}}>ვიცი</button></>
          ) : <div style={{width:'100%', textAlign:'center', opacity:0.4}}>დააჭირე გადასაბრუნებლად</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={STYLES.container}>
      <h1 style={{marginBottom: '30px', fontWeight: '900'}}>გერმანული ზენი</h1>
      
      <div style={STYLES.tabBar}>
        <button onClick={() => setActiveTab('session')} style={STYLES.tab(activeTab === 'session')}>სესია</button>
        <button onClick={() => setActiveTab('manage')} style={STYLES.tab(activeTab === 'manage')}>მართვა</button>
        <button onClick={() => setActiveTab('list')} style={STYLES.tab(activeTab === 'list')}>ლექსიკონი ({allWords.length})</button>
      </div>

      {activeTab === 'session' && (
        <div style={{background: 'white', padding: '40px', borderRadius: '30px', width: '400px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'}}>
          <h3 style={{marginBottom: '20px'}}>სესიის მომართვა</h3>
          <select value={selBook} onChange={e => {setSelBook(e.target.value); setSelLesson('ყველა');}} style={STYLES.input}>{books.map(b => <option key={b} value={b}>{b}</option>)}</select>
          <select value={selLesson} onChange={e => setSelLesson(e.target.value)} style={STYLES.input}>{getLessons(selBook).map(l => <option key={l} value={l}>{l}</option>)}</select>
          <div style={{marginBottom:'20px', fontSize:'14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span>რაოდენობა:</span>
            <input type="number" value={cardLimit} onChange={e => setCardLimit(e.target.value)} style={{width:'60px', padding:'5px'}}/>
          </div>
          <button onClick={() => {
            const pool = allWords.filter(w => (selBook === 'ყველა' || w.book === selBook) && (selLesson === 'ყველა' || w.lesson === selLesson));
            if (pool.length === 0) return alert("სიტყვები ვერ მოიძებნა!");
            setSessionWords(pool.sort(() => Math.random() - 0.5).slice(0, cardLimit));
            setIsSessionActive(true); setCurrentIndex(0); setIsFlipped(false);
          }} style={{...STYLES.btn, background: '#1e293b', color: 'white', width: '100%'}}>დაწყება 🚀</button>
        </div>
      )}

      {activeTab === 'manage' && (
        <div style={{background: 'white', padding: '30px', borderRadius: '24px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}}>
          <h4>{editingWord ? "რედაქტირება" : "ახალი სიტყვა"}</h4>
          <form onSubmit={editingWord ? handleSaveEdit : handleAddManual}>
            <input placeholder="გერმანული" style={STYLES.input} value={editingWord ? editingWord.de : newWord.de} onChange={e => editingWord ? setEditingWord({...editingWord, de: e.target.value}) : setNewWord({...newWord, de: e.target.value})} required />
            <input placeholder="ქართული" style={STYLES.input} value={editingWord ? editingWord.ka : newWord.ka} onChange={e => editingWord ? setEditingWord({...editingWord, ka: e.target.value}) : setNewWord({...newWord, ka: e.target.value})} required />
            <div style={{display:'flex', gap:'10px'}}>
              <input placeholder="სქესი (m/f/n)" style={STYLES.input} value={editingWord ? editingWord.gender : newWord.gender} onChange={e => editingWord ? setEditingWord({...editingWord, gender: e.target.value}) : setNewWord({...newWord, gender: e.target.value})} />
              <input placeholder="გაკვეთილი" style={STYLES.input} value={editingWord ? editingWord.lesson : newWord.lesson} onChange={e => editingWord ? setEditingWord({...editingWord, lesson: e.target.value}) : setNewWord({...newWord, lesson: e.target.value})} />
            </div>
            <input placeholder="წიგნი" style={STYLES.input} value={editingWord ? editingWord.book : newWord.book} onChange={e => editingWord ? setEditingWord({...editingWord, book: e.target.value}) : setNewWord({...newWord, book: e.target.value})} />
            <textarea placeholder="მაგალითი..." style={{...STYLES.input, height:'60px'}} value={editingWord ? editingWord.example : newWord.example} onChange={e => editingWord ? setEditingWord({...editingWord, example: e.target.value}) : setNewWord({...newWord, example: e.target.value})} />
            <button type="submit" style={{...STYLES.btn, background: '#10b981', color: 'white', width: '100%'}}>{editingWord ? "განახლება" : "დამატება"}</button>
            {editingWord && <button type="button" onClick={() => setEditingWord(null)} style={{background:'none', border:'none', color:'#94a3b8', width:'100%', marginTop:'10px', cursor:'pointer'}}>გაუქმება</button>}
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div style={STYLES.wordList}>
          {/* ძებნის ველი */}
          <input 
            placeholder="🔍 ძებნა (DE ან KA)..." 
            style={STYLES.input} 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          {/* ფილტრების პანელი */}
          <div style={STYLES.filterGrid}>
            <select value={listBook} onChange={e => {setListBook(e.target.value); setListLesson('ყველა');}} style={STYLES.input}>
              {books.map(b => <option key={b} value={b}>{b === 'ყველა' ? 'ყველა წიგნი' : b}</option>)}
            </select>
            <select value={listLesson} onChange={e => setListLesson(e.target.value)} style={STYLES.input}>
              {getLessons(listBook).map(l => <option key={l} value={l}>{l === 'ყველა' ? 'ყველა გაკვეთილი' : `გაკვეთილი ${l}`}</option>)}
            </select>
          </div>

          {/* სორტირების პანელი */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', fontSize:'12px', color:'#64748b'}}>
            <span>ნაპოვნია: {filteredList.length}</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{border:'none', background:'none', color:'#3b82f6', fontWeight:'bold', cursor:'pointer'}}>
              <option value="newest">ჯერ ახლები</option>
              <option value="oldest">ჯერ ძველები</option>
              <option value="az">A-Z (გერმანული)</option>
            </select>
          </div>

          <div style={{maxHeight: '50vh', overflowY: 'auto'}}>
            {filteredList.map(w => (
              <div key={w.id} style={STYLES.wordRow}>
                <div style={{flex: 1}}>
                  <strong style={{color: STYLES.genderColors[w.gender] || '#1e293b'}}>{w.de}</strong>
                  <div style={{fontSize: '12px', color: '#64748b'}}>{w.ka} <span style={{opacity:0.5, marginLeft:'10px'}}>({w.date})</span></div>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                  <button onClick={() => handleEditClick(w)} style={{background:'#f1f5f9', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>✏️</button>
                  <button onClick={() => handleDelete(w.id)} style={{background:'#fee2e2', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{marginTop:'40px', background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:'11px'}}>გამოსვლა (კოდი: {syncCode})</button>
    </div>
  );
}