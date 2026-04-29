import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const genderPalette = {
  m: { bg: '#EBF3FA', accent: '#4A7FA5', dot: '#4A7FA5', label: 'der' },
  f: { bg: '#FAF0F4', accent: '#A5607A', dot: '#A5607A', label: 'die' },
  n: { bg: '#EDF6F1', accent: '#4E8C6E', dot: '#4E8C6E', label: 'das' },
  default: { bg: '#F5F0EA', accent: '#6B6359', dot: '#A89F94', label: '—' }
};

export default function Card({ card, isFlipped, setIsFlipped, handleAnswer, onCancel, total, current }) {
  const palette = genderPalette[card.gender] || genderPalette.default;

  return (
    <div className="flex flex-col items-center w-full max-w-[420px] mx-auto">

      {/* Progress bar */}
      <div className="w-full mb-8">
        <div className="flex justify-between items-center mb-2">
          <span style={{ color: 'var(--ink-faint)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            {current} / {total}
          </span>
          <button
            onClick={onCancel}
            style={{ color: 'var(--ink-faint)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}
            className="hover:text-[var(--ink)] transition-colors"
          >
            გასვლა
          </button>
        </div>
        <div style={{ height: '3px', background: 'var(--cream-border)', borderRadius: '99px', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: palette.accent, borderRadius: '99px', originX: 0 }}
            initial={{ scaleX: (current - 1) / total }}
            animate={{ scaleX: current / total }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Card container */}
      <div className="perspective w-full" style={{ height: '420px' }}>
        <div className={`card-inner ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>

          {/* FRONT */}
          <div
            className="card-front flex flex-col items-center justify-center cursor-pointer select-none p-10"
            style={{ background: palette.bg, border: `1px solid ${palette.accent}18` }}
          >
            {/* Gender pill */}
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: `${palette.accent}18`, color: palette.accent,
                borderRadius: '99px', padding: '5px 14px',
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: '32px'
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: palette.accent }} />
              {palette.label}
            </div>

            <div style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 'clamp(2.2rem, 8vw, 3.2rem)',
              lineHeight: 1.1,
              color: 'var(--ink)',
              textAlign: 'center',
              letterSpacing: '-0.01em'
            }}>
              {card.de}
            </div>

            <div style={{ marginTop: '48px', color: 'var(--ink-faint)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
              {card.book} · {card.lesson ? `გაკვ. ${card.lesson}` : ''}
            </div>

            <motion.div
              style={{ marginTop: '16px', color: 'var(--ink-faint)', fontSize: '12px', opacity: 0.6 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            >
              ↕ გადაბრუნება
            </motion.div>
          </div>

          {/* BACK */}
          <div
            className="card-back flex flex-col items-center justify-center cursor-pointer select-none p-10"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--cream-border)' }}
          >
            <div style={{ color: 'var(--ink-faint)', fontSize: '13px', fontWeight: 500, marginBottom: '16px', letterSpacing: '0.04em' }}>
              {card.de}
            </div>
            <div style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 'clamp(2rem, 7vw, 2.8rem)',
              color: 'var(--ink)',
              textAlign: 'center',
              letterSpacing: '-0.01em',
              lineHeight: 1.15
            }}>
              {card.ka}
            </div>
            {card.example && (
              <div style={{
                marginTop: '28px',
                paddingTop: '24px',
                borderTop: '1px solid var(--cream-border)',
                color: 'var(--ink-muted)',
                fontSize: '14px',
                fontStyle: 'italic',
                textAlign: 'center',
                lineHeight: 1.6
              }}>
                "{card.example}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answer buttons */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex gap-3 w-full mt-6"
          >
            <button
              onClick={() => handleAnswer(false)}
              style={{
                flex: 1, padding: '16px',
                background: '#FFF5F5', color: 'var(--danger)',
                border: '1px solid #F5CECE', borderRadius: '18px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.02em', transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.target.style.background = '#FAEAEA'}
              onMouseLeave={e => e.target.style.background = '#FFF5F5'}
            >
              არ ვიცი
            </button>
            <button
              onClick={() => handleAnswer(true)}
              style={{
                flex: 1, padding: '16px',
                background: '#F0FAF5', color: 'var(--success)',
                border: '1px solid #C4E8D5', borderRadius: '18px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.02em', transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.target.style.background = '#E4F7EC'}
              onMouseLeave={e => e.target.style.background = '#F0FAF5'}
            >
              ვიცი
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
