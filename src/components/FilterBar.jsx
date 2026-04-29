import React from 'react';

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'var(--cream)',
  border: '1px solid var(--cream-border)',
  borderRadius: '14px',
  outline: 'none',
  fontSize: '14px',
  color: 'var(--ink)',
  fontFamily: 'inherit',
  fontWeight: 500,
  transition: 'border-color 0.15s ease',
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--ink-faint)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '8px',
  display: 'block',
};

export default function FilterBar({ books, lessons, selBook, setSelBook, selLesson, setSelLesson, cardLimit, setCardLimit, onStart }) {
  return (
    <div style={{
      background: 'var(--surface-raised)',
      borderRadius: '28px',
      padding: '36px',
      width: '100%',
      maxWidth: '400px',
      border: '1px solid var(--cream-border)',
      boxShadow: '0 2px 24px -4px rgba(26, 23, 20, 0.07)',
    }}>
      <h3 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: '22px',
        color: 'var(--ink)',
        marginBottom: '28px',
        letterSpacing: '-0.02em'
      }}>
        სესიის მომართვა
      </h3>

      <div className="space-y-5">
        <div>
          <label style={labelStyle}>წიგნი</label>
          <select
            value={selBook}
            onChange={(e) => setSelBook(e.target.value)}
            style={inputStyle}
          >
            {books.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>გაკვეთილი</label>
          <select
            value={selLesson}
            onChange={(e) => setSelLesson(e.target.value)}
            style={inputStyle}
          >
            {lessons.map(l => <option key={l} value={l}>{l === 'ყველა' ? 'ყველა' : `გაკვეთილი ${l}`}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
          <span style={{ fontSize: '14px', color: 'var(--ink-muted)', fontWeight: 500 }}>ბარათების რაოდენობა</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setCardLimit(Math.max(1, +cardLimit - 5))}
              style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'var(--cream)', border: '1px solid var(--cream-border)',
                color: 'var(--ink-muted)', fontSize: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1
              }}
            >−</button>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: 'var(--ink)', minWidth: '32px', textAlign: 'center' }}>{cardLimit}</span>
            <button
              onClick={() => setCardLimit(+cardLimit + 5)}
              style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'var(--cream)', border: '1px solid var(--cream-border)',
                color: 'var(--ink-muted)', fontSize: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1
              }}
            >+</button>
          </div>
        </div>

        <button
          onClick={onStart}
          style={{
            width: '100%', padding: '16px',
            background: 'var(--ink)', color: 'var(--cream)',
            borderRadius: '18px', border: 'none',
            fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.02em',
            fontFamily: 'inherit',
            marginTop: '8px',
            transition: 'background 0.15s ease, transform 0.1s ease',
          }}
          onMouseEnter={e => e.target.style.background = '#2D2926'}
          onMouseLeave={e => e.target.style.background = 'var(--ink)'}
          onMouseDown={e => e.target.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.target.style.transform = 'scale(1)'}
        >
          სესიის დაწყება
        </button>
      </div>
    </div>
  );
}
