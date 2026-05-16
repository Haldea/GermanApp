import React, { useRef } from 'react';

const genderMeta = {
  m: { color: '#4A7FA5' },
  f: { color: '#A5607A' },
  n: { color: '#5E8C5A' },
  default: { color: '#7A917B' },
};

const selectStyle = {
  padding: '11px 36px 11px 14px',
  background: 'var(--cream)',
  border: '1px solid var(--cream-border)',
  borderRadius: '14px',
  fontSize: '13px',
  color: 'var(--ink-muted)',
  fontFamily: 'inherit',
  fontWeight: 600,
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A917B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  width: '100%',
};

export default function WordList({
  searchTerm, setSearchTerm, listBook, setListBook, listLesson, setListLesson,
  books, getLessons, filteredList, handleEditClick, handleDelete,
  sortBy, setSortBy, handleCsvImport, t
}) {
  const csvInputRef = useRef(null);

  const sortLabel = sortBy === 'newest' ? t.sortNewest : sortBy === 'oldest' ? t.sortOldest : t.sortAZ;

  return (
    <div style={{
      width: '100%',
      background: 'var(--surface-raised)',
      borderRadius: '28px',
      padding: '28px',
      border: '1px solid var(--cream-border)',
      boxShadow: '0 2px 24px -4px rgba(44, 59, 45, 0.08)',
      boxSizing: 'border-box',
    }}>

      {/* Search + CSV import row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', fontSize: '15px', pointerEvents: 'none' }}>⌕</span>
          <input
            placeholder={t.search}
            style={{ width: '100%', padding: '13px 16px 13px 40px', background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '14px', outline: 'none', fontSize: '14px', color: 'var(--ink)', fontFamily: 'inherit', fontWeight: 500, boxSizing: 'border-box' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--ink-muted)'}
            onBlur={e => e.target.style.borderColor = 'var(--cream-border)'}
          />
        </div>

        {/* CSV Import button */}
        <button
          onClick={() => csvInputRef.current?.click()}
          title={t.importCsv}
          style={{
            flexShrink: 0,
            padding: '12px 16px',
            background: 'var(--orange)',
            color: '#fff',
            border: 'none',
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(224,123,57,0.25)',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          ↑ CSV
        </button>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: 'none' }}
          onChange={e => { handleCsvImport(e.target.files[0]); e.target.value = ''; }}
        />
      </div>

      {/* Filters row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <select
          value={listBook}
          onChange={e => { setListBook(e.target.value); setListLesson(t.all); }}
          style={selectStyle}
        >
          {books.map(b => <option key={b} value={b}>{b === t.all ? t.allBooks : b}</option>)}
        </select>
        <select
          value={listLesson}
          onChange={e => setListLesson(e.target.value)}
          style={selectStyle}
        >
          {getLessons(listBook).map(l => <option key={l} value={l}>{l === t.all ? t.allLessons : `${t.lessonPrefix} ${l}`}</option>)}
        </select>
      </div>

      {/* Meta row — count + sort */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', padding: '0 2px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {t.found}: {filteredList.length} {t.words}
        </span>

        {/* Sort — proper select so label is never clipped */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--orange)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            outline: 'none',
            fontFamily: 'inherit',
            appearance: 'none',
            paddingRight: '4px',
          }}
        >
          <option value="newest">{t.sortNewest}</option>
          <option value="oldest">{t.sortOldest}</option>
          <option value="az">{t.sortAZ}</option>
        </select>
      </div>

      {/* Word rows */}
      <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '2px' }}>
        {filteredList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-faint)', fontSize: '14px' }}>
            {t.noResults}
          </div>
        ) : filteredList.map(w => {
          const meta = genderMeta[w.gender] || genderMeta.default;
          return (
            <div
              key={w.id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 14px', marginBottom: '6px', background: 'var(--cream)', borderRadius: '16px', transition: 'background 0.15s ease', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--cream)'}
              onClick={() => handleEditClick(w)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: meta.color }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.de}</div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.ka}</span>
                    {w.date && <span style={{ color: 'var(--ink-faint)', fontSize: '11px', flexShrink: 0 }}>{w.date}</span>}
                  </div>
                </div>
              </div>

              {/* Action buttons — stop propagation so they don't trigger edit */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '8px' }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => handleEditClick(w)}
                  title="Edit"
                  style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--surface-raised)', border: '1px solid var(--cream-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}
                >✏️</button>
                <button
                  onClick={() => handleDelete(w.id)}
                  title="Delete"
                  style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#FFF5F5', border: '1px solid #F5CECE', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}
                >🗑️</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
