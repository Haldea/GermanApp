import React from 'react';

const genderMeta = {
  m: { color: '#4A7FA5' },
  f: { color: '#A5607A' },
  n: { color: '#4E8C6E' },
  default: { color: '#A89F94' },
};

export default function WordList({ searchTerm, setSearchTerm, listBook, setListBook, listLesson, setListLesson, books, getLessons, filteredList, handleEditClick, handleDelete, sortBy, setSortBy, t }) {
  return (
    <div style={{ width: '100%', maxWidth: '720px', background: 'var(--surface-raised)', borderRadius: '28px', padding: '32px', border: '1px solid var(--cream-border)', boxShadow: '0 2px 24px -4px rgba(26, 23, 20, 0.07)' }}>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', fontSize: '15px', pointerEvents: 'none' }}>⌕</span>
        <input
          placeholder={t.search}
          style={{ width: '100%', padding: '13px 16px 13px 42px', background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '16px', outline: 'none', fontSize: '14px', color: 'var(--ink)', fontFamily: 'inherit', fontWeight: 500, boxSizing: 'border-box' }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <select
          value={listBook}
          onChange={e => { setListBook(e.target.value); setListLesson(t.all); }}
          style={{ padding: '11px 36px 11px 14px', background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '14px', fontSize: '13px', color: 'var(--ink-muted)', fontFamily: 'inherit', fontWeight: 600, outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A89F94' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
        >
          {books.map(b => <option key={b} value={b}>{b === t.all ? t.allBooks : b}</option>)}
        </select>
        <select
          value={listLesson}
          onChange={e => setListLesson(e.target.value)}
          style={{ padding: '11px 36px 11px 14px', background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '14px', fontSize: '13px', color: 'var(--ink-muted)', fontFamily: 'inherit', fontWeight: 600, outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A89F94' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
        >
          {getLessons(listBook).map(l => <option key={l} value={l}>{l === t.all ? t.allLessons : `${t.lessonPrefix} ${l}`}</option>)}
        </select>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {t.found}: {filteredList.length} {t.words}
        </span>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: 'var(--masc)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', outline: 'none', fontFamily: 'inherit', appearance: 'none' }}
        >
          <option value="newest">{t.sortNewest}</option>
          <option value="oldest">{t.sortOldest}</option>
          <option value="az">{t.sortAZ}</option>
        </select>
      </div>

      {/* List */}
      <div style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
        {filteredList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-faint)', fontSize: '14px' }}>{t.noResults}</div>
        ) : (
          filteredList.map(w => {
            const meta = genderMeta[w.gender] || genderMeta.default;
            return (
              <div
                key={w.id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', marginBottom: '6px', background: 'var(--cream)', borderRadius: '16px', transition: 'background 0.15s ease' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--cream)'}
                className="group"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: meta.color, marginTop: '2px' }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.de}</div>
                    <div style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {w.ka}
                      {w.date && <span style={{ color: 'var(--ink-faint)', fontSize: '11px' }}>{w.date}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }} className="group-hover:opacity-100">
                  <button onClick={() => handleEditClick(w)} style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--surface-raised)', border: '1px solid var(--cream-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✏️</button>
                  <button onClick={() => handleDelete(w.id)} style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#FFF5F5', border: '1px solid #F5CECE', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🗑️</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
