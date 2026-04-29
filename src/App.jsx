import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";

// --- YOUR FIREBASE CONFIG (Already filled from your screenshot) ---
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
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafb', fontFamily: '"Inter", sans-serif', padding: '40px 20px', color: '#1e293b' },
  card: { width: '450px', height: '450px', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', textAlign: 'center', padding: '40px', transition: 'transform 0.2s ease', lineHeight: '1.4', userSelect: 'none' },
  genderColors: { m: '#3b82f6', f: '#ec4899', n: '#10b981', default: '#64748b' },
  btn: { padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '100%', marginBottom: '10px' }
};

export default function GermanZenFinal() {
  const [syncCode, setSyncCode] = useState(localStorage.getItem('zen_code'));
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputCode, setInputCode] = useState("");

  // Session/UI States
  const [sessionWords, setSessionWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [selBook, setSelBook] = useState('All');
  const [selLesson, setSelLesson] = useState('All');
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
      // New custom code used for first time -> Copy Master List
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

  const handleEntry = (e) => {
    e.preventDefault();
    const code = inputCode.trim().toLowerCase();
    if (code === 'zen' || code === 'ichliebedich') {
      localStorage.setItem('zen_code', code);
      setSyncCode(code);
    } else {
      alert("Invalid Access Code. Please use your assigned code.");
    }
  };

  const handleAnswer = (isCorrect) => {
    const updated = [...allWords];
    const masterIdx = updated.findIndex(w => w.id === sessionWords[currentIndex].id);
    updated[masterIdx].level = isCorrect ? Math.min((updated[masterIdx].level || 1) + 1, 3) : 1;
    setAllWords(updated);
    syncToCloud(updated);

    if (currentIndex < sessionWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsSessionActive(false);
      alert("🏁 Session Finished!");
    }
  };

  const books = ['All', ...new Set(allWords.map(w => w.book))];
  const lessons = ['All', ...new Set(allWords.filter(w => selBook === 'All' || w.book === selBook).map(w => w.lesson))];

  // --- ACCESS SCREEN ---
  if (!syncCode) {
    return (
      <div style={STYLES.container}>
        <h1 style={{marginBottom: '50px', fontWeight: '900'}}>German Zen</h1>
        <form onSubmit={handleEntry} style={{background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '350px', textAlign: 'center'}}>
          <p style={{marginBottom: '20px', color: '#64748b', fontSize: '14px'}}>Enter your private access code:</p>
          <input 
            type="text" 
            placeholder="Your Code..." 
            style={{...STYLES.input, textAlign: 'center', fontSize: '18px', fontWeight: 'bold'}}
            onChange={e => setInputCode(e.target.value)} 
          />
          <button type="submit" style={{...STYLES.btn, background: '#1e293b', color: 'white', width: '100%', marginTop: '10px'}}>Enter App</button>
        </form>
      </div>
    );
  }

  if (loading) return <div style={STYLES.container}>Syncing Cloud Database...</div>;

  // --- SESSION VIEW ---
  if (isSessionActive) {
    const card = sessionWords[currentIndex];
    return (
      <div style={STYLES.container}>
        <div style={{width: '450px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#94a3b8', fontSize: '13px'}}>
          <button onClick={() => setIsSessionActive(false)} style={{background:'none', border:'none', cursor:'pointer'}}>✕ Cancel</button>
          <span>{currentIndex + 1} / {sessionWords.length}</span>
          <button onClick={() => setIsSessionActive(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#3b82f6'}}>💾 Save & Exit</button>
        </div>
        <div onClick={() => setIsFlipped(!isFlipped)} style={{...STYLES.card, backgroundColor: STYLES.genderColors[card.gender] || STYLES.genderColors.default, color: 'white'}}>
          <div style={{fontSize: '13px', opacity: 0.7, marginBottom: '25px'}}>{card.book} | Lesson {card.lesson}</div>
          <div style={{fontSize: '42px', fontWeight: 'bold'}}>{isFlipped ? card.ka : card.de}</div>
          {isFlipped && card.example && <div style={{marginTop: '35px', fontSize: '18px', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '20px'}}>"{card.example}"</div>}
        </div>
        <div style={{marginTop: '30px', display: 'flex', gap: '20px', width: '450px'}}>
          {isFlipped ? (
            <>
              <button onClick={() => handleAnswer(false)} style={{flex:1, padding:'16px', background:'#f87171', color:'white', border:'none', borderRadius:'15px', fontWeight:'bold'}}>Wrong</button>
              <button onClick={() => handleAnswer(true)} style={{flex:1, padding:'16px', background:'#34d399', color:'white', border:'none', borderRadius:'15px', fontWeight:'bold'}}>Correct</button>
            </>
          ) : <div style={{width:'100%', textAlign:'center', opacity:0.4}}>Click card to flip</div>}
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div style={STYLES.container}>
      <div style={{position:'absolute', top: 20, right: 20, textAlign: 'right'}}>
        <span style={{fontSize: '11px', color: '#94a3b8'}}>Sync: {syncCode}</span><br/>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{background:'none', border:'none', color:'#3b82f6', fontSize:'11px', cursor:'pointer', textDecoration: 'underline'}}>Log Out</button>
      </div>

      <h1 style={{marginBottom: '50px', fontWeight: '900'}}>German Zen</h1>
      
      <div style={{background: 'white', padding: '40px', borderRadius: '30px', width: '400px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'}}>
        <h3 style={{marginBottom: '20px', opacity: 0.6}}>Study Session</h3>
        <select value={selBook} onChange={e => setSelBook(e.target.value)} style={STYLES.input}>{books.map(b => <option key={b}>{b}</option>)}</select>
        <select value={selLesson} onChange={e => setSelLesson(e.target.value)} style={STYLES.input}>{lessons.map(l => <option key={l}>{l}</option>)}</select>
        <button onClick={() => {
          const pool = allWords.filter(w => (selBook === 'All' || w.book === selBook) && (selLesson === 'All' || w.lesson === selLesson));
          setSessionWords(pool.sort(() => Math.random() - 0.5).slice(0, cardLimit));
          setIsSessionActive(true);
          setCurrentIndex(0);
          setIsFlipped(false);
        }} style={{width:'100%', padding:'15px', background:'#1e293b', color:'white', border:'none', borderRadius:'12px', fontWeight:'bold', cursor:'pointer'}}>Start 🚀</button>
      </div>

      <button onClick={() => setShowManager(!showManager)} style={{marginTop:'30px', color:'#94a3b8', background:'none', border:'none', textDecoration:'underline', cursor:'pointer'}}>Manage Vocabulary</button>
      
      {showManager && (
        <div style={{marginTop: '20px', background: 'white', padding: '30px', borderRadius: '25px', width: '400px', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}}>
          <h4 style={{marginBottom:'15px'}}>Add Word</h4>
          <form onSubmit={(e) => {
            e.preventDefault();
            const updated = [...allWords, { ...newWord, id: Date.now().toString(), level: 1, date: new Date().toLocaleDateString() }];
            setAllWords(updated);
            syncToCloud(updated);
            setNewWord({ de: '', ka: '', gender: '', example: '', book: '', lesson: '' });
          }}>
            <input placeholder="German" style={STYLES.input} value={newWord.de} onChange={e => setNewWord({...newWord, de: e.target.value})} required />
            <input placeholder="Georgian" style={STYLES.input} value={newWord.ka} onChange={e => setNewWord({...newWord, ka: e.target.value})} required />
            <button type="submit" style={{width:'100%', padding:'10px', background:'#10b981', color:'white', border:'none', borderRadius:'8px'}}>Add to My Cloud</button>
          </form>
        </div>
      )}
    </div>
  );
}