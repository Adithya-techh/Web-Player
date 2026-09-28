import React, { useEffect, useRef } from 'react';
import { X, Mic2, Music } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function LyricsView() {
  const { currentTrack, currentTime, seekTo, isLyricsOpen, setIsLyricsOpen } = useAudio();
  const activeLyricRef = useRef(null);
  const containerRef = useRef(null);

  if (!isLyricsOpen || !currentTrack) return null;

  const lyrics = currentTrack.lyrics || [
    { time: 0, text: "♪ Instrumental ♪" },
    { time: 10, text: currentTrack.title },
    { time: 20, text: `by ${currentTrack.artist}` }
  ];

  // Find currently active lyric index
  let activeIndex = 0;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Smooth auto-scroll to active lyric
  useEffect(() => {
    if (activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  return (
    <div 
      className="fixed inset-0 top-16 bottom-24 left-0 sm:left-64 z-30 overflow-y-auto p-8 flex flex-col items-center select-none transition-all duration-500"
      style={{
        background: `linear-gradient(180deg, ${currentTrack.color || '#6366f1'} 0%, #121212 90%)`
      }}
      ref={containerRef}
    >
      {/* Top Bar with Close button */}
      <div className="w-full max-w-3xl flex items-center justify-between pb-6 border-b border-white/10 mb-8">
        <div className="flex items-center gap-3">
          <Mic2 className="w-6 h-6 text-white" />
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">{currentTrack.title}</h2>
            <p className="text-xs text-white/70">{currentTrack.artist} • Karaoke Mode</p>
          </div>
        </div>

        <button
          onClick={() => setIsLyricsOpen(false)}
          className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
          title="Close Lyrics"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Lyrics lines */}
      <div className="w-full max-w-2xl flex flex-col gap-6 py-12">
        {lyrics.map((line, idx) => {
          const isActive = idx === activeIndex;
          const isPassed = idx < activeIndex;

          return (
            <p
              key={idx}
              ref={isActive ? activeLyricRef : null}
              onClick={() => seekTo(line.time)}
              className={`text-2xl sm:text-4xl font-extrabold tracking-tight transition-all duration-300 cursor-pointer py-1 ${
                isActive
                  ? 'text-white scale-[1.02] drop-shadow-[0_4px_16px_rgba(255,255,255,0.4)]'
                  : isPassed
                  ? 'text-white/60 hover:text-white/90'
                  : 'text-black/50 hover:text-white/70'
              }`}
            >
              {line.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
