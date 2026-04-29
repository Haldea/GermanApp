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
  boxSizing: 'border-box',
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

export default function ManageWord({ editingWord, setEditingWord, newWord, setNewWord, handleSaveEdit, handleAddManual }) {
  const data = editingWord || newWord;
  const setData = editingWord ? setEditingWord : setNewWord;
  const handleChange = (field, val) => setData({ ...data, [field]: val });

  return (
    <div style={{
      background: 'var(--surface-raised)',
      borderRadius: '28px',
      padding: '36px',
      width: '100%',
      maxWidth: '450px',
      border: '1px solid var(--cream-border)',
      boxShadow: '0 2px 24px -4px rgba(26, 23, 20, 0.07)',
    }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
          {editingWord ? 'რედაქტირება' : 'ახალი სიტყვა'}
        </div>
        <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0 }}>
          {editingWord ? editingWord.de : 'სიტყვის დამატება'}
        </h4>
      </div>

      <form onSubmit={editingWord ? handleSaveEdit : handleAddManual}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={labelStyle}>გერმანული</label>
            <input style={inputStyle} placeholder="das Wort" value={data.de} onChange={e => handleChange('de', e.target.value)} required
              onFocus={e => e.target.style.borderColor = 'var(--ink-muted)'}
              onBlur={e => e.target.style.borderColor = 'var(--cream-border)'}
            />
          </div>

          <div>
            <label style={labelStyle}>ქართული</label>
            <input style={inputStyle} placeholder="სიტყვა" value={data.ka} onChange={e => handleChange('ka', e.target.value)} required
              onFocus={e => e.target.style.borderColor = 'var(--ink-muted)'}
              onBlur={e => e.target.style.borderColor = 'var(--cream-border)'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>სქესი</label>
              <select style={inputStyle} value={data.gender} onChange={e => handleChange('gender', e.target.value)}>
                <option value="">—</option>
                <option value="m">der (m)</option>
                <option value="f">die (f)</option>
                <option value="n">das (n)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>გაკვეთილი</label>
              <input style={inputStyle} placeholder="მაგ: 3" value={data.lesson} onChange={e => handleChange('lesson', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--ink-muted)'}
                onBlur={e => e.target.style.borderColor = 'var(--cream-border)'}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>წიგნი</label>
            <input style={inputStyle} placeholder="მაგ: A1.1" value={data.book} onChange={e => handleChange('book', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--ink-muted)'}
              onBlur={e => e.target.style.borderColor = 'var(--cream-border)'}
            />
          </div>

          <div>
            <label style={labelStyle}>მაგალითი</label>
            <textarea
              style={{ ...inputStyle, height: '88px', resize: 'none' }}
              placeholder="Das ist ein Beispielsatz..."
              value={data.example}
              onChange={e => handleChange('example', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--ink-muted)'}
              onBlur={e => e.target.style.borderColor = 'var(--cream-border)'}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '16px', background: 'var(--success)', color: '#fff',
              borderRadius: '18px', border: 'none', fontSize: '14px',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '0.02em', marginTop: '4px',
              transition: 'background 0.15s ease, transform 0.1s ease',
            }}
            onMouseDown={e => e.target.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.target.style.transform = 'scale(1)'}
          >
            {editingWord ? 'განახლება' : 'დამატება'}
          </button>

          {editingWord && (
            <button
              type="button"
              onClick={() => setEditingWord(null)}
              style={{
                padding: '12px', background: 'transparent', color: 'var(--ink-faint)',
                borderRadius: '18px', border: '1px solid var(--cream-border)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              გაუქმება
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
