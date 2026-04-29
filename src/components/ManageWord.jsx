import React from 'react';

const inputStyle = {
  width: '100%', padding: '12px 16px',
  background: 'var(--cream)', border: '1px solid var(--cream-border)',
  borderRadius: '14px', outline: 'none', fontSize: '14px',
  color: 'var(--ink)', fontFamily: 'inherit', fontWeight: 500,
  boxSizing: 'border-box', transition: 'border-color 0.15s ease',
};

const selectStyle = {
  ...inputStyle,
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

const focus = e => e.target.style.borderColor = 'var(--ink-muted)';
const blur = e => e.target.style.borderColor = 'var(--cream-border)';

export default function ManageWord({ editingWord, setEditingWord, newWord, setNewWord, handleSaveEdit, handleAddManual, t }) {
  const data = editingWord || newWord;
  const setData = editingWord ? setEditingWord : setNewWord;
  const handleChange = (field, val) => setData({ ...data, [field]: val });

  return (
    <div style={{ background: 'var(--surface-raised)', borderRadius: '28px', padding: '36px', width: '100%', maxWidth: '450px', border: '1px solid var(--cream-border)', boxShadow: '0 2px 24px -4px rgba(26, 23, 20, 0.07)' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
          {editingWord ? t.editWord : t.addWord}
        </div>
        <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0 }}>
          {editingWord ? editingWord.de : t.addWordTitle}
        </h4>
      </div>

      <form onSubmit={editingWord ? handleSaveEdit : handleAddManual}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={labelStyle}>{t.targetWordLabel}</label>
            <input style={inputStyle} placeholder={t.targetWordPlaceholder} value={data.de} onChange={e => handleChange('de', e.target.value)} required onFocus={focus} onBlur={blur} />
          </div>

          <div>
            <label style={labelStyle}>{t.nativeWordLabel}</label>
            <input style={inputStyle} placeholder={t.nativeWordPlaceholder} value={data.ka} onChange={e => handleChange('ka', e.target.value)} required onFocus={focus} onBlur={blur} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>{t.gender}</label>
              <select style={selectStyle} value={data.gender} onChange={e => handleChange('gender', e.target.value)}>
                <option value="">{t.genderNone}</option>
                <option value="m">{t.genderM}</option>
                <option value="f">{t.genderF}</option>
                <option value="n">{t.genderN}</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.lessonLabel}</label>
              <input style={inputStyle} placeholder={t.lessonShortPlaceholder} value={data.lesson} onChange={e => handleChange('lesson', e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t.bookLabel}</label>
            <input style={inputStyle} placeholder={t.bookPlaceholder} value={data.book} onChange={e => handleChange('book', e.target.value)} onFocus={focus} onBlur={blur} />
          </div>

          <div>
            <label style={labelStyle}>{t.exampleLabel}</label>
            <textarea style={{ ...inputStyle, height: '88px', resize: 'none' }} placeholder={t.examplePlaceholder} value={data.example} onChange={e => handleChange('example', e.target.value)} onFocus={focus} onBlur={blur} />
          </div>

          <button type="submit" style={{ padding: '16px', background: 'var(--success)', color: '#fff', borderRadius: '18px', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em', marginTop: '4px', transition: 'transform 0.1s ease' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {editingWord ? t.update : t.add}
          </button>

          {editingWord && (
            <button type="button" onClick={() => setEditingWord(null)} style={{ padding: '12px', background: 'transparent', color: 'var(--ink-faint)', borderRadius: '18px', border: '1px solid var(--cream-border)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {t.cancel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
