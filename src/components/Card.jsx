import React from 'react';

export default function Card({ card, isFlipped, setIsFlipped, handleAnswer }) {
  const genderColors = { m: 'bg-blue-500', f: 'bg-pink-500', n: 'bg-emerald-500', default: 'bg-slate-500' };

  return (
    <div className="flex flex-col items-center">
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className={`${genderColors[card.gender] || genderColors.default} w-[350px] h-[450px] md:w-[450px] rounded-[32px] flex flex-col items-center justify-center cursor-pointer shadow-2xl text-center p-10 transition-transform active:scale-95 text-white select-none`}
      >
        <div className="text-xs opacity-70 mb-6 uppercase tracking-widest">{card.book} | გაკვეთილი {card.lesson}</div>
        <div className="text-4xl md:text-5xl font-bold leading-tight">
          {isFlipped ? card.ka : card.de}
        </div>
        {isFlipped && card.example && (
          <div className="mt-8 pt-6 border-t border-white/20 italic text-lg">
            "{card.example}"
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4 w-full max-w-[450px]">
        {isFlipped ? (
          <>
            <button onClick={() => handleAnswer(false)} className="flex-1 py-4 bg-red-400 text-white rounded-2xl font-bold shadow-lg active:bg-red-500">არ ვიცი</button>
            <button onClick={() => handleAnswer(true)} className="flex-1 py-4 bg-emerald-400 text-white rounded-2xl font-bold shadow-lg active:bg-emerald-500">ვიცი</button>
          </>
        ) : (
          <div className="w-full text-center text-slate-400 animate-pulse">დააჭირე გადასაბრუნებლად</div>
        )}
      </div>
    </div>
  );
}