import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";
import { motion, AnimatePresence } from 'framer-motion';

import Card from './components/Card';
import FilterBar from './components/FilterBar';
import WordList from './components/WordList';
import ManageWord from './components/ManageWord';

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

const TABS = [
  { id: 'session', label: 'სესია' },
  { id: 'manage', label: 'მართვა' },
  { id: 'list', label: 'ლექსიკონი' },
];

export default function LuminaApp() {
  const [syncCode, setSyncCode] = useState(localStorage.getItem('zen_code'));
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('session');
  const [inputCode, setInputCode] = useState('');

  const [sessionWords, setSessionWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const [listBook, setListBook] = useState('ყველა');
  const [listLesson, setListLesson] = useState('ყველა');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [selBook, setSelBook] = useState('ყველა');
  const [selLesson, setSelLesson] = useState('ყველა');
  const [cardLimit, setCardLimit] = useState(20);

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

  const startSession = () => {
    const pool = allWords.filter(w => (selBook === 'ყველა' || w.book === selBook) && (selLesson === 'ყველა' || w.lesson === selLesson));
    if (pool.length === 0) return alert('სიტყვები ვერ მოიძებნა!');
    setSessionWords(pool.sort(() => Math.random() - 0.5).slice(0, cardLimit));
    setIsSessionActive(true);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleAddManual = (e) => {
    e.preventDefault();
    if (allWords.some(w => w.de.toLowerCase() === newWord.de.toLowerCase())) {
      alert('⚠️ ეს სიტყვა უკვე არსებობს!'); return;
    }
    const updated = [...allWords, { ...newWord, id: Date.now().toString(), level: 1, timestamp: Date.now(), date: new Date().toLocaleDateString() }];
    setAllWords(updated);
    syncToCloud(updated);
    setNewWord({ de: '', ka: '', gender: '', example: '', book: '', lesson: '' });
    alert('✅ დაემატა!');
  };

  const handleDelete = (id) => {
    if (window.confirm('ნამდვილად გსურთ წაშლა?')) {
      const updated = allWords.filter(w => w.id !== id);
      setAllWords(updated);
      syncToCloud(updated);
    }
  };

  const handleEditClick = (word) => {
    setEditingWord({ ...word });
    setActiveTab('manage');
    window.scrollTo(0, 0);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updated = allWords.map(w => w.id === editingWord.id ? editingWord : w);
    setAllWords(updated);
    syncToCloud(updated);
    setEditingWord(null);
    alert('✅ განახლდა!');
  };

  const handleAnswer = (isCorrect) => {
    const updated = [...allWords];
    const idx = updated.findIndex(w => w.id === sessionWords[currentIndex].id);
    updated[idx].level = isCorrect ? Math.min((updated[idx].level || 1) + 1, 3) : 1;
    setAllWords(updated);
    syncToCloud(updated);
    if (currentIndex < sessionWords.length - 1) {
      setCurrentIndex(c => c + 1);
      setIsFlipped(false);
    } else {
      setIsSessionActive(false);
      alert('🏁 სესია დასრულდა!');
    }
  };

  const books = ['ყველა', ...new Set(allWords.map(w => w.book).filter(Boolean))];
  const getLessons = (book) => ['ყველა', ...new Set(allWords.filter(w => book === 'ყველა' || w.book === book).map(w => w.lesson).filter(Boolean))];

  const filteredList = useMemo(() => {
    let list = allWords.filter(w => {
      const matchesSearch = w.de?.toLowerCase().includes(searchTerm.toLowerCase()) || w.ka?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBook = listBook === 'ყველა' || w.book === listBook;
      const matchesLesson = listLesson === 'ყველა' || w.lesson === listLesson;
      return matchesSearch && matchesBook && matchesLesson;
    });
    if (sortBy === 'newest') list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    if (sortBy === 'oldest') list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    if (sortBy === 'az') list.sort((a, b) => a.de.localeCompare(b.de));
    return list;
  }, [allWords, searchTerm, listBook, listLesson, sortBy]);

  // ─── Login Screen ───────────────────────────────────────────────
  if (!syncCode) {
    return (
      <div style={{
        minHeight: '100svh',
        background: 'var(--cream)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          style={{
            background: 'var(--surface-raised)',
            borderRadius: '32px',
            padding: '48px 40px',
            width: '100%',
            maxWidth: '360px',
            border: '1px solid var(--cream-border)',
            boxShadow: '0 4px 40px -8px rgba(26, 23, 20, 0.12)',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              LUMINA
            </span>
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '32px',
            color: 'var(--ink)',
            letterSpacing: '-0.03em',
            margin: '0 0 8px',
          }}>
            გერმანული
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ink-faint)', marginBottom: '36px', lineHeight: 1.5 }}>
            შეიყვანეთ თქვენი წვდომის კოდი
          </p>

          <form onSubmit={(e) => { e.preventDefault(); setSyncCode(inputCode.toLowerCase()); localStorage.setItem('zen_code', inputCode.toLowerCase()); }}>
            <input
              placeholder="მაგ: zen ან ichliebedich"
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'var(--cream)',
                border: '1px solid var(--cream-border)',
                borderRadius: '16px',
                fontSize: '15px',
                color: 'var(--ink)',
                fontFamily: 'inherit',
                fontWeight: 600,
                textAlign: 'center',
                outline: 'none',
                marginBottom: '12px',
                boxSizing: 'border-box',
                letterSpacing: '0.04em',
              }}
              onChange={e => setInputCode(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--ink-muted)'}
              onBlur={e => e.target.style.borderColor = 'var(--cream-border)'}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '15px',
                background: 'var(--ink)',
                color: 'var(--cream)',
                borderRadius: '18px',
                border: 'none',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.02em',
              }}
            >
              შესვლა
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ─── Loading ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: 'var(--ink-muted)', letterSpacing: '-0.02em' }}
        >
          იტვირთება...
        </motion.div>
      </div>
    );
  }

  // ─── Main App ─────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100svh',
      background: 'var(--cream)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: '80px',
    }}>
      {/* Header */}
      {!isSessionActive && (
        <header style={{
          width: '100%',
          maxWidth: '720px',
          padding: '32px 24px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>
              LUMINA
            </div>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 'clamp(24px, 5vw, 30px)',
              color: 'var(--ink)',
              letterSpacing: '-0.03em',
              margin: 0,
            }}>
              გერმანული
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              fontSize: '11px', fontWeight: 600, color: 'var(--ink-faint)',
              background: 'var(--surface-raised)', padding: '6px 12px',
              borderRadius: '99px', border: '1px solid var(--cream-border)',
              letterSpacing: '0.06em',
            }}>
              {syncCode}
            </div>
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              style={{
                fontSize: '11px', color: 'var(--ink-faint)', background: 'none',
                border: 'none', cursor: 'pointer', padding: '6px 10px',
                fontFamily: 'inherit', letterSpacing: '0.06em', fontWeight: 600,
              }}
            >
              ↩
            </button>
          </div>
        </header>
      )}

      {/* Tab Bar */}
      {!isSessionActive && (
        <div style={{
          display: 'flex',
          background: 'var(--surface-raised)',
          borderRadius: '18px',
          padding: '5px',
          margin: '28px 24px 32px',
          border: '1px solid var(--cream-border)',
          gap: '2px',
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setEditingWord(null); }}
              style={{
                padding: '10px 20px',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'inherit',
                letterSpacing: '0.02em',
                transition: 'all 0.18s ease',
                background: activeTab === tab.id ? 'var(--ink)' : 'transparent',
                color: activeTab === tab.id ? 'var(--cream)' : 'var(--ink-faint)',
              }}
            >
              {tab.id === 'list' ? `${tab.label} (${allWords.length})` : tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <main style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
        <AnimatePresence mode="wait">
          {isSessionActive ? (
            <motion.div
              key="card"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              style={{ width: '100%', maxWidth: '420px', paddingTop: '32px' }}
            >
              <Card
                card={sessionWords[currentIndex]}
                isFlipped={isFlipped}
                setIsFlipped={setIsFlipped}
                handleAnswer={handleAnswer}
                onCancel={() => setIsSessionActive(false)}
                total={sessionWords.length}
                current={currentIndex + 1}
              />
            </motion.div>
          ) : activeTab === 'session' ? (
            <motion.div key="session" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <FilterBar
                books={books}
                lessons={getLessons(selBook)}
                selBook={selBook} setSelBook={setSelBook}
                selLesson={selLesson} setSelLesson={setSelLesson}
                cardLimit={cardLimit} setCardLimit={setCardLimit}
                onStart={startSession}
              />
            </motion.div>
          ) : activeTab === 'manage' ? (
            <motion.div key="manage" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <ManageWord
                editingWord={editingWord} setEditingWord={setEditingWord}
                newWord={newWord} setNewWord={setNewWord}
                handleSaveEdit={handleSaveEdit}
                handleAddManual={handleAddManual}
              />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ width: '100%' }}>
              <WordList
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                listBook={listBook} setListBook={setListBook}
                listLesson={listLesson} setListLesson={setListLesson}
                books={books} getLessons={getLessons}
                filteredList={filteredList}
                handleEditClick={handleEditClick}
                handleDelete={handleDelete}
                sortBy={sortBy} setSortBy={setSortBy}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
