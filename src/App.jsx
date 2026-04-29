import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";

// --- FIREBASE CONFIG (თქვენი მონაცემები) ---
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
  btn: { padding: '14px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }
};

export default function GermanZenGeorgian() {
  const [syncCode, setSyncCode] = useState(localStorage.getItem('zen_code'));
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputCode, setInputCode] = useState("");

  // სესიის და მართვის სტეიტები
  const [sessionWords, setSessionWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showManager, setShowManager] = useState(false);
  
  const [selBook, setSelBook] = useState('ყველა');
  const [selLesson, setSelLesson] = useState('ყველა');
  const [cardLimit, setCardLimit] = useState(20);
  const [newWord, setNewWord] = useState({ de: '', ka: '', gender: '', example: '', book: '', lesson: '' });

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

  const syncToCloud = (data) => set(ref(db, `users/${syncCode.toLowerCase()}/words`), data);

  const handleAddManual = (e) => {
    e.preventDefault();
    if (allWords.some(w => w.de.toLowerCase() === newWord.de.toLowerCase())) {
      alert("⚠️ ეს სიტყვა უკვე არსებობს!"); return;
    }
    const updated = [...allWords, { ...newWord, id: Date.now().toString(), level: 1, date: new Date().toLocaleDateString() }];
    setAllWords(updated);
    syncToCloud(updated);
    setNewWord({ de: '', ka: '', gender: '', example: '', book: '', lesson: '' });
    alert("✅ სიტყვა დაემატა!");
  };

  const handleCSV = (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = ev.target.result.split('\n').slice(1);
      const newEntries = rows.map(r => {
        const [de, ka, gender, example, book, lesson] = r.split(',');
        return de ? { id: Math.random().toString(), de: de.trim(), ka: ka.trim(), gender: gender.trim(), example: example.trim(), book: book.trim(), lesson: lesson.trim(), level: 1 } : null;
      }).filter(x => x);
      const updated = [...allWords, ...newEntries];
      setAllWords(updated);
      syncToCloud(updated);
      alert("✅ ფაილი წარმატებით აიტვირთა!");
    };
    reader.readAsText(e.target.files[0]);
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
  const lessons = ['ყველა', ...new Set(allWords.filter(w => selBook === 'ყველა' || w.book === selBook).map(w => w.lesson))];

  // --- UI: შესვლა ---
  if (!syncCode) {
    return (
      <div style={STYLES.container}>
        <h1 style={{marginBottom: '50px', fontWeight: '900'}}>გერმანული ზენი</h1>
        <form onSubmit={(e) => { e.preventDefault(); setSyncCode(inputCode.toLowerCase()); localStorage.setItem('zen_code', inputCode.toLowerCase()); }} style={{background: 'white', padding: '40px', borderRadius: '24px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}}>
          <p style={{marginBottom: '15px', fontSize: '14px', color: '#64748b'}}>შეიყვანეთ თქვენი კოდი:</p>
          <input placeholder="მაგ: zen ან ichliebedich" style={STYLES.input} onChange={e => setInputCode(e.target.value)} />
          <button type="submit" style={{...STYLES.btn, background: '#1e293b', color: 'white', width: '100%'}}>შესვლა</button>
        </form>
      </div>
    );
  }

  if (loading) return <div style={STYLES.container}>სინქრონიზაცია...</div>;

  // --- UI: სესია ---
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

  // --- UI: მთავარი პანელი ---
  return (
    <div style={STYLES.container}>
      <div style={{position:'absolute', top:20, right:20, textAlign: 'right'}}>
        <span style={{fontSize: '11px', color: '#94a3b8'}}>კოდი: {syncCode}</span><br/>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{background:'none', border:'none', color:'#3b82f6', fontSize:'11px', cursor:'pointer', textDecoration: 'underline'}}>გამოსვლა</button>
      </div>

      <h1 style={{marginBottom: '50px', fontWeight: '900'}}>გერმანული ზენი</h1>
      
      <div style={{background: 'white', padding: '40px', borderRadius: '30px', width: '400px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'}}>
        <h3 style={{marginBottom: '20px'}}>სესიის მომართვა</h3>
        <div style={{textAlign: 'left', marginBottom: '10px', fontSize: '13px', color: '#64748b'}}>წიგნი:</div>
        <select value={selBook} onChange={e => setSelBook(e.target.value)} style={STYLES.input}>{books.map(b => <option key={b} value={b}>{b}</option>)}</select>
        
        <div style={{textAlign: 'left', marginBottom: '10px', fontSize: '13px', color: '#64748b'}}>გაკვეთილი:</div>
        <select value={selLesson} onChange={e => setSelLesson(e.target.value)} style={STYLES.input}>{lessons.map(l => <option key={l} value={l}>{l}</option>)}</select>
        
        <div style={{marginBottom:'20px', fontSize:'14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>სიტყვების რაოდენობა:</span>
          <input type="number" value={cardLimit} onChange={e => setCardLimit(e.target.value)} style={{width:'60px', padding: '5px', borderRadius: '5px', border: '1px solid #ddd'}}/>
        </div>
        
        <button onClick={() => {
          const pool = allWords.filter(w => (selBook === 'ყველა' || w.book === selBook) && (selLesson === 'ყველა' || w.lesson === selLesson));
          if (pool.length === 0) { alert("ამ ფილტრით სიტყვები ვერ მოიძებნა!"); return; }
          setSessionWords(pool.sort(() => Math.random() - 0.5).slice(0, cardLimit));
          setIsSessionActive(true); setCurrentIndex(0); setIsFlipped(false);
        }} style={{...STYLES.btn, background: '#1e293b', color: 'white', width: '100%'}}>სესიის დაწყება 🚀</button>
      </div>

      <button onClick={() => setShowManager(!showManager)} style={{marginTop:'30px', background:'none', border:'none', textDecoration:'underline', color:'#94a3b8', cursor:'pointer'}}>ლექსიკონის მართვა</button>

      {showManager && (
        <div style={{marginTop: '20px', background: 'white', padding: '30px', borderRadius: '24px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}}>
          <h4 style={{marginBottom:'15px'}}>ახალი სიტყვის დამატება</h4>
          <form onSubmit={handleAddManual}>
            <input placeholder="გერმანული (მაგ: die Stadt)" style={STYLES.input} value={newWord.de} onChange={e => setNewWord({...newWord, de: e.target.value})} required />
            <input placeholder="ქართული (მაგ: ქალაქი)" style={STYLES.input} value={newWord.ka} onChange={e => setNewWord({...newWord, ka: e.target.value})} required />
            <div style={{display:'flex', gap:'10px'}}>
              <input placeholder="სქესი (m/f/n)" style={STYLES.input} value={newWord.gender} onChange={e => setNewWord({...newWord, gender: e.target.value})} />
              <input placeholder="გაკვეთილი" style={STYLES.input} value={newWord.lesson} onChange={e => setNewWord({...newWord, lesson: e.target.value})} />
            </div>
            <input placeholder="წიგნი (მაგ: A1.1)" style={STYLES.input} value={newWord.book} onChange={e => setNewWord({...newWord, book: e.target.value})} />
            <textarea placeholder="მაგალითი..." style={{...STYLES.input, height:'60px', fontFamily: 'inherit'}} value={newWord.example} onChange={e => setNewWord({...newWord, example: e.target.value})} />
            <button type="submit" style={{...STYLES.btn, background: '#10b981', color: 'white', width: '100%'}}>დამატება</button>
          </form>
          <div style={{marginTop:'20px', borderTop:'1px solid #eee', paddingTop:'20px'}}>
            <p style={{fontSize:'12px', color:'#94a3b8', marginBottom: '10px'}}>CSV ფაილის ატვირთვა</p>
            <input type="file" accept=".csv" onChange={handleCSV} style={{fontSize: '12px'}}/>
          </div>
        </div>
      )}
    </div>
  );
}