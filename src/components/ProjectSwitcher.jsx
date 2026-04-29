import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  boxSizing: 'border-box',
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

export default function ProjectSwitcher({ projects, activeProject, onSelect, onCreate, onDelete, onClose, t }) {
  const [showForm, setShowForm] = useState(projects.length === 0);
  const [form, setForm] = useState({ name: '', targetLang: '', nativeLang: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.targetLang.trim()) return;
    onCreate(form);
    setForm({ name: '', targetLang: '', nativeLang: '' });
    setShowForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(26, 23, 20, 0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && projects.length > 0) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        style={{
          background: 'var(--surface-raised)',
          borderRadius: '28px',
          padding: '32px',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid var(--cream-border)',
          boxShadow: '0 8px 60px -12px rgba(26, 23, 20, 0.2)',
          maxHeight: '90svh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
              {t.projects}
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
              {t.switchProject}
            </h2>
          </div>
          {projects.length > 0 && (
            <button onClick={onClose} style={{ background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '10px', width: '34px', height: '34px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          )}
        </div>

        {/* Project list */}
        {projects.length > 0 && (
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {projects.map(p => {
              const isActive = activeProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    border: isActive ? '1.5px solid var(--ink)' : '1px solid var(--cream-border)',
                    background: isActive ? 'var(--cream-dark)' : 'var(--cream)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => { onSelect(p); onClose(); }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.01em' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-faint)', marginTop: '2px' }}>
                      {p.targetLang}{p.nativeLang ? ` ↔ ${p.nativeLang}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isActive && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ink)' }} />
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(p); }}
                      style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: '#FFF5F5', border: '1px solid #F5CECE',
                        cursor: 'pointer', fontSize: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Divider / toggle */}
        {projects.length > 0 && (
          <button
            onClick={() => setShowForm(v => !v)}
            style={{
              width: '100%', padding: '12px',
              background: 'transparent',
              border: '1.5px dashed var(--cream-border)',
              borderRadius: '16px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700, color: 'var(--ink-faint)',
              fontFamily: 'inherit', letterSpacing: '0.04em',
              marginBottom: showForm ? '20px' : '0',
              transition: 'all 0.15s ease',
            }}
          >
            {showForm ? '↑ გაქრობა' : `+ ${t.newProject}`}
          </button>
        )}

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onSubmit={handleCreate}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: projects.length === 0 ? '0' : '4px' }}>
                <div>
                  <label style={labelStyle}>{t.projectName}</label>
                  <input
                    style={inputStyle}
                    placeholder={t.projectNamePlaceholder}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    onFocus={e => e.target.style.borderColor = 'var(--ink-muted)'}
                    onBlur={e => e.target.style.borderColor = 'var(--cream-border)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t.targetLang}</label>
                  <input
                    style={inputStyle}
                    placeholder={t.targetLangPlaceholder}
                    value={form.targetLang}
                    onChange={e => setForm(f => ({ ...f, targetLang: e.target.value }))}
                    required
                    onFocus={e => e.target.style.borderColor = 'var(--ink-muted)'}
                    onBlur={e => e.target.style.borderColor = 'var(--cream-border)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t.nativeLang}</label>
                  <input
                    style={inputStyle}
                    placeholder={t.nativeLangPlaceholder}
                    value={form.nativeLang}
                    onChange={e => setForm(f => ({ ...f, nativeLang: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = 'var(--ink-muted)'}
                    onBlur={e => e.target.style.borderColor = 'var(--cream-border)'}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '14px', background: 'var(--ink)', color: 'var(--cream)',
                    borderRadius: '16px', border: 'none', fontSize: '14px',
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    letterSpacing: '0.02em', marginTop: '4px',
                  }}
                >
                  {t.createProject}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
