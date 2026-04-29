import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, remove } from "firebase/database";
import { motion, AnimatePresence } from 'framer-motion';

import Card from './components/Card';
import FilterBar from './components/FilterBar';
import WordList from './components/WordList';
import ManageWord from './components/ManageWord';
import ProjectSwitcher from './components/ProjectSwitcher';
import { translations } from './i18n';

const firebaseConfig = {
  apiKey: "AIzaSyBMi9oH8-aryirYICzU5KbndFX3ks3TAHY",
  authDomain: "germanapp-c2462.firebaseapp.com",
  databaseURL: "https://germanapp-c2462-default-rtdb.firebaseio.com",
  projectId: "germanapp-c2462",
  storageBucket: "germanapp-c2462.firebasestorage.app",
  messagingSenderId: "959594266621",
  appId: "1:959594266621:web:482b85671130b33f7ce394"
};

const fbApp = initializeApp(firebaseConfig);
const db = getDatabase(fbApp);

// ─── Helpers ────────────────────────────────────────────────────────────────

function wordsPath(syncCode, projectId) {
  return `users/${syncCode.toLowerCase()}/projects/${projectId}/words`;
}

function projectsMetaPath(syncCode) {
  return `users/${syncCode.toLowerCase()}/projectsMeta`;
}

// Legacy path for backwards-compat migration
function legacyWordsPath(syncCode) {
  return `users/${syncCode.toLowerCase()}/words`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LuminaApp() {
  // Persisted prefs
  const [syncCode, setSyncCode] = useState(localStorage.getItem('zen_code'));
  const [lang, setLang] = useState(localStorage.getItem('lumina_lang') || 'ka');
  const t = translations[lang];

  // Projects
  const [projects, setProjects] = useState([]); // [{id, name, targetLang, nativeLang}]
  const [activeProject, setActiveProject] = useState(null);
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);

  // Words
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState('session');
  const [inputCode, setInputCode] = useState('');

  // Session
  const [sessionWords, setSessionWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Filters — list
  const [listBook, setListBook] = useState(t.all);
  const [listLesson, setListLesson] = useState(t.all);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Filters — session
  const [selBook, setSelBook] = useState(t.all);
  const [selLesson, setSelLesson] = useState(t.all);
  const [cardLimit, setCardLimit] = useState(20);

  // Word forms
  const [newWord, setNewWord] = useState({ de: '', ka: '', gender: '', example: '', book: '', lesson: '' });
  const [editingWord, setEditingWord] = useState(null);

  // ── Load projects meta on login ──
  useEffect(() => {
    if (!syncCode) return;
    loadProjects();
  }, [syncCode]);

  // ── Load words when active project changes ──
  useEffect(() => {
    if (!syncCode || !activeProject) return;
    loadWords(activeProject.id);
    // Reset filter sentinels to match current language
    setSelBook(t.all);
    setSelLesson(t.all);
    setListBook(t.all);
    setListLesson(t.all);
  }, [activeProject]);

  // ── Keep lang pref in localStorage ──
  const switchLang = (l) => {
    setLang(l);
    localStorage.setItem('lumina_lang', l);
  };

  // ── Projects ────────────────────────────────────────────────────────────────

  const loadProjects = async () => {
    setLoading(true);
    const snap = await get(ref(db, projectsMetaPath(syncCode)));
    let list = [];

    if (snap.exists()) {
      list = Object.values(snap.val());
    } else {
      // First-time user: migrate legacy words into a default "German" project
      const legacySnap = await get(ref(db, legacyWordsPath(syncCode)));
      const defaultProject = {
        id: 'default',
        name: 'German',
        targetLang: 'Deutsch',
        nativeLang: 'Georgian',
      };
      list = [defaultProject];
      await set(ref(db, projectsMetaPath(syncCode)), { default: defaultProject });

      if (legacySnap.exists()) {
        // Move legacy words under new path
        await set(ref(db, wordsPath(syncCode, 'default')), legacySnap.val());
      } else {
        // Copy masterList
        const masterSnap = await get(ref(db, 'masterList'));
        if (masterSnap.exists()) {
          await set(ref(db, wordsPath(syncCode, 'default')), masterSnap.val());
        }
      }
    }

    setProjects(list);

    // Restore last-used project
    const savedProjectId = localStorage.getItem(`lumina_project_${syncCode}`);
    const lastUsed = list.find(p => p.id === savedProjectId) || list[0];

    if (lastUsed) {
      setActiveProject(lastUsed);
    } else {
      setShowProjectSwitcher(true);
    }
    setLoading(false);
  };

  const handleCreateProject = async (form) => {
    const id = Date.now().toString();
    const newProj = { id, name: form.name.trim(), targetLang: form.targetLang.trim(), nativeLang: form.nativeLang.trim() };
    const updatedProjects = [...projects, newProj];
    setProjects(updatedProjects);
    await set(ref(db, `${projectsMetaPath(syncCode)}/${id}`), newProj);
    handleSelectProject(newProj);
  };

  const handleSelectProject = (proj) => {
    setActiveProject(proj);
    localStorage.setItem(`lumina_project_${syncCode}`, proj.id);
    setAllWords([]);
    setActiveTab('session');
    setEditingWord(null);
    setIsSessionActive(false);
  };

  const handleDeleteProject = async (proj) => {
    if (!window.confirm(t.confirmDeleteProject)) return;
    const updated = projects.filter(p => p.id !== proj.id);
    setProjects(updated);
    await remove(ref(db, `${projectsMetaPath(syncCode)}/${proj.id}`));
    await remove(ref(db, wordsPath(syncCode, proj.id)));

    if (activeProject?.id === proj.id) {
      if (updated.length > 0) {
        handleSelectProject(updated[0]);
      } else {
        setActiveProject(null);
        setAllWords([]);
        setShowProjectSwitcher(true);
      }
    }
  };

  // ── Words ───────────────────────────────────────────────────────────────────

  const loadWords = async (projectId) => {
    setLoading(true);
    const snap = await get(ref(db, wordsPath(syncCode, projectId)));
    if (snap.exists()) {
      setAllWords(Object.values(snap.val()));
    } else {
      setAllWords([]);
    }
    setLoading(false);
  };

  const syncToCloud = (updatedWords) =>
    set(ref(db, wordsPath(syncCode, activeProject.id)), updatedWords);

  const startSession = () => {
    const pool = allWords.filter(w =>
      (selBook === t.all || w.book === selBook) &&
      (selLesson === t.all || w.lesson === selLesson)
    );
    if (pool.length === 0) return alert(t.noWordsFound);
    setSessionWords(pool.sort(() => Math.random() - 0.5).slice(0, cardLimit));
    setIsSessionActive(true);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleAddManual = (e) => {
    e.preventDefault();
    if (allWords.some(w => w.de.toLowerCase() === newWord.de.toLowerCase())) {
      alert(t.wordExists); return;
    }
    const updated = [...allWords, { ...newWord, id: Date.now().toString(), level: 1, timestamp: Date.now(), date: new Date().toLocaleDateString() }];
    setAllWords(updated);
    syncToCloud(updated);
    setNewWord({ de: '', ka: '', gender: '', example: '', book: '', lesson: '' });
    alert(t.wordAdded);
  };

  const handleDelete = (id) => {
    if (window.confirm(t.confirmDelete)) {
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
    alert(t.wordUpdated);
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
      alert(t.sessionDone);
    }
  };

  const books = [t.all, ...new Set(allWords.map(w => w.book).filter(Boolean))];
  const getLessons = (book) => [t.all, ...new Set(allWords.filter(w => book === t.all || w.book === book).map(w => w.lesson).filter(Boolean))];

  const filteredList = useMemo(() => {
    let list = allWords.filter(w => {
      const matchesSearch = w.de?.toLowerCase().includes(searchTerm.toLowerCase()) || w.ka?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBook = listBook === t.all || w.book === listBook;
      const matchesLesson = listLesson === t.all || w.lesson === listLesson;
      return matchesSearch && matchesBook && matchesLesson;
    });
    if (sortBy === 'newest') list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    if (sortBy === 'oldest') list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    if (sortBy === 'az') list.sort((a, b) => a.de.localeCompare(b.de));
    return list;
  }, [allWords, searchTerm, listBook, listLesson, sortBy, t.all]);

  const TABS = [
    { id: 'session', label: t.session },
    { id: 'manage', label: t.manage },
    { id: 'list', label: t.dictionary },
  ];

  // ── Shared style helpers ──────────────────────────────────────────────────

  const pillBtn = (active) => ({
    padding: '6px 14px',
    borderRadius: '99px',
    border: active ? '1.5px solid var(--ink)' : '1px solid var(--cream-border)',
    background: active ? 'var(--ink)' : 'var(--surface-raised)',
    color: active ? 'var(--cream)' : 'var(--ink-faint)',
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  });

  // ── Screens ───────────────────────────────────────────────────────────────

  // LOGIN
  if (!syncCode) {
    return (
      <div style={{ minHeight: '100svh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        {/* Language toggle on login screen */}
        <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '6px' }}>
          <button onClick={() => switchLang('ka')} style={pillBtn(lang === 'ka')}>KA</button>
          <button onClick={() => switchLang('en')} style={pillBtn(lang === 'en')}>EN</button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          style={{ background: 'var(--surface-raised)', borderRadius: '32px', padding: '48px 40px', width: '100%', maxWidth: '360px', border: '1px solid var(--cream-border)', boxShadow: '0 4px 40px -8px rgba(26, 23, 20, 0.12)', textAlign: 'center' }}
        >
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>LUMINA</span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', color: 'var(--ink)', letterSpacing: '-0.03em', margin: '0 0 8px' }}>
            Vocabulary
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ink-faint)', marginBottom: '36px', lineHeight: 1.5 }}>
            {t.enterCode}
          </p>
          <form onSubmit={(e) => { e.preventDefault(); setSyncCode(inputCode.toLowerCase()); localStorage.setItem('zen_code', inputCode.toLowerCase()); }}>
            <input
              placeholder={t.codePlaceholder}
              style={{ width: '100%', padding: '14px 18px', background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '16px', fontSize: '15px', color: 'var(--ink)', fontFamily: 'inherit', fontWeight: 600, textAlign: 'center', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', letterSpacing: '0.04em' }}
              onChange={e => setInputCode(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--ink-muted)'}
              onBlur={e => e.target.style.borderColor = 'var(--cream-border)'}
            />
            <button type="submit" style={{ width: '100%', padding: '15px', background: 'var(--ink)', color: 'var(--cream)', borderRadius: '18px', border: 'none', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em' }}>
              {t.login}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // LOADING
  if (loading) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: 'var(--ink-muted)', letterSpacing: '-0.02em' }}>
          {t.loading}
        </motion.div>
      </div>
    );
  }

  // MAIN APP
  return (
    <div style={{ minHeight: '100svh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '80px' }}>

      {/* Header */}
      {!isSessionActive && (
        <header style={{ width: '100%', maxWidth: '720px', padding: '28px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Left: wordmark + project name */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>LUMINA</div>
            <button
              onClick={() => setShowProjectSwitcher(true)}
              style={{ display: 'flex', alignItems: 'baseline', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
            >
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(22px, 5vw, 28px)', color: 'var(--ink)', letterSpacing: '-0.03em', margin: 0 }}>
                {activeProject?.name || '—'}
              </h1>
              <span style={{ fontSize: '13px', color: 'var(--ink-faint)', fontWeight: 600 }}>↕</span>
            </button>
            {activeProject?.targetLang && (
              <div style={{ fontSize: '12px', color: 'var(--ink-faint)', marginTop: '3px', letterSpacing: '0.02em' }}>
                {activeProject.targetLang}{activeProject.nativeLang ? ` ↔ ${activeProject.nativeLang}` : ''}
              </div>
            )}
          </div>

          {/* Right: lang toggle + sync code + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {/* Lang pills */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => switchLang('ka')} style={pillBtn(lang === 'ka')}>KA</button>
              <button onClick={() => switchLang('en')} style={pillBtn(lang === 'en')}>EN</button>
            </div>

            {/* Sync code */}
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-faint)', background: 'var(--surface-raised)', padding: '6px 12px', borderRadius: '99px', border: '1px solid var(--cream-border)', letterSpacing: '0.06em' }}>
              {syncCode}
            </div>

            {/* Logout */}
            <button
              onClick={() => { localStorage.removeItem('zen_code'); window.location.reload(); }}
              style={{ fontSize: '14px', color: 'var(--ink-faint)', background: 'var(--surface-raised)', border: '1px solid var(--cream-border)', borderRadius: '99px', cursor: 'pointer', padding: '6px 12px', fontFamily: 'inherit', fontWeight: 600, transition: 'color 0.15s' }}
              title="Logout"
            >
              {t.logout}
            </button>
          </div>
        </header>
      )}

      {/* Tab bar */}
      {!isSessionActive && (
        <div style={{ display: 'flex', background: 'var(--surface-raised)', borderRadius: '18px', padding: '5px', margin: '24px 24px 28px', border: '1px solid var(--cream-border)', gap: '2px' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setEditingWord(null); }}
              style={{ padding: '10px 20px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'inherit', letterSpacing: '0.02em', transition: 'all 0.18s ease', background: activeTab === tab.id ? 'var(--ink)' : 'transparent', color: activeTab === tab.id ? 'var(--cream)' : 'var(--ink-faint)' }}
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
            <motion.div key="card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} style={{ width: '100%', maxWidth: '420px', paddingTop: '32px' }}>
              <Card card={sessionWords[currentIndex]} isFlipped={isFlipped} setIsFlipped={setIsFlipped} handleAnswer={handleAnswer} onCancel={() => setIsSessionActive(false)} total={sessionWords.length} current={currentIndex + 1} t={t} />
            </motion.div>
          ) : activeTab === 'session' ? (
            <motion.div key="session" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <FilterBar books={books} lessons={getLessons(selBook)} selBook={selBook} setSelBook={setSelBook} selLesson={selLesson} setSelLesson={setSelLesson} cardLimit={cardLimit} setCardLimit={setCardLimit} onStart={startSession} t={t} />
            </motion.div>
          ) : activeTab === 'manage' ? (
            <motion.div key="manage" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <ManageWord editingWord={editingWord} setEditingWord={setEditingWord} newWord={newWord} setNewWord={setNewWord} handleSaveEdit={handleSaveEdit} handleAddManual={handleAddManual} t={t} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ width: '100%' }}>
              <WordList searchTerm={searchTerm} setSearchTerm={setSearchTerm} listBook={listBook} setListBook={setListBook} listLesson={listLesson} setListLesson={setListLesson} books={books} getLessons={getLessons} filteredList={filteredList} handleEditClick={handleEditClick} handleDelete={handleDelete} sortBy={sortBy} setSortBy={setSortBy} t={t} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Project Switcher modal */}
      <AnimatePresence>
        {showProjectSwitcher && (
          <ProjectSwitcher
            projects={projects}
            activeProject={activeProject}
            onSelect={handleSelectProject}
            onCreate={handleCreateProject}
            onDelete={handleDeleteProject}
            onClose={() => setShowProjectSwitcher(false)}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
