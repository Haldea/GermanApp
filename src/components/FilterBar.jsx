import React from 'react';

const inputStyle = {
  width: '100%', padding: '12px 16px',
  background: 'var(--cream)', border: '1px solid var(--cream-border)',
  borderRadius: '14px', outline: 'none', fontSize: '14px',
  color: 'var(--ink)', fontFamily: 'inherit', fontWeight: 500,
  transition: 'border-color 0.15s ease', boxSizing: 'border-box',
  appearance: 'none',
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A89F94' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
  paddingRight: '36px',
};

const labelStyle = {
  fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  marginBottom: '8px', display: 'block',
};

export default function FilterBar({ books, lessons, selBook, setSelBook, selLesson, setSelLesson, cardLimit, setCardLimit, onStart, t }) {
  return (
    <div style={{ background: 'var(--surface-raised)', borderRadius: '28px', padding: '36px', width: '100%', maxWidth: '400px', border: '1px solid var(--cream-border)', boxShadow: '0 2px 24px -4px rgba(26, 23, 20, 0.07)' }}>
      <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: 'var(--ink)', marginBottom: '28px', letterSpacing: '-0.02em', margin: '0 0 28px' }}>
        {t.configSession}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>{t.book}</label>
          <select value={selBook} onChange={e => setSelBook(e.target.value)} style={inputStyle}>
            {books.map(b => <option key={b} value={b}>{b === t.all ? t.allBooks : b}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>{t.lesson}</label>
          <select value={selLesson} onChange={e => setSelLesson(e.target.value)} style={inputStyle}>
            {lessons.map(l => <option key={l} value={l}>{l === t.all ? t.allLessons : `${t.lessonPrefix} ${l}`}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
          <span style={{ fontSize: '14px', color: 'var(--ink-muted)', fontWeight: 500 }}>{t.cardCount}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {[['−', -5], ['+', 5]].map(([sym, delta], i) => (
              i === 0 ? (
                <button key={sym} onClick={() => setCardLimit(Math.max(1, +cardLimit + delta))} style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--cream)', border: '1px solid var(--cream-border)', color: 'var(--ink-muted)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{sym}</button>
              ) : (
                <>
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: 'var(--ink)', minWidth: '32px', textAlign: 'center' }}>{cardLimit}</span>
                  <button key={sym} onClick={() => setCardLimit(+cardLimit + delta)} style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--cream)', border: '1px solid var(--cream-border)', color: 'var(--ink-muted)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{sym}</button>
                </>
              )
            ))}
          </div>
        </div>

        <button
          onClick={onStart}
          style={{ width: '100%', padding: '16px', background: 'var(--ink)', color: 'var(--cream)', borderRadius: '18px', border: 'none', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em', marginTop: '8px', transition: 'transform 0.1s ease' }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {t.startSession}
        </button>
      </div>
    </div>
  );
}
