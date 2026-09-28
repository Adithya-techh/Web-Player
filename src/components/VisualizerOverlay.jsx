import React, { useEffect, useRef, useState } from 'react';
import { X, Activity, Radio, Disc } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function VisualizerOverlay() {
  const { isVisualizerOpen, setIsVisualizerOpen, getFrequencyData, isPlaying, currentTrack } = useAudio();
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [visualMode, setVisualMode] = useState('bars'); // 'bars' | 'circular' | 'wave'

  useEffect(() => {
    if (!isVisualizerOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      // Handle canvas resolution
      const width = canvas.width = canvas.parentElement.clientWidth;
      const height = canvas.height = canvas.parentElement.clientHeight;

      // Dark translucent background with motion trail
      ctx.fillStyle = 'rgba(10, 10, 10, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Get frequency data from AudioContext or simulate if no audio context source
      let data = getFrequencyData();
      if (!data || !isPlaying) {
        data = new Uint8Array(64);
        const time = Date.now() * 0.003;
        for (let i = 0; i < 64; i++) {
          data[i] = isPlaying ? Math.abs(Math.sin(time + i * 0.2)) * 180 + 30 : Math.sin(time + i * 0.1) * 20 + 25;
        }
      }

      if (visualMode === 'bars') {
        // Equalizer Bars - Vibrant Purple & Violet Neon Gradient
        const barCount = 48;
        const barWidth = (width / barCount) * 0.7;
        const spacing = (width / barCount) * 0.3;

        for (let i = 0; i < barCount; i++) {
          const value = data[i % data.length] || 0;
          const barHeight = (value / 255) * (height * 0.65);

          const x = i * (barWidth + spacing) + spacing / 2;
          const y = height - barHeight - 40;

          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, '#7e22ce'); // Deep purple
          gradient.addColorStop(0.5, '#a855f7'); // Radiant violet
          gradient.addColorStop(1, '#f472b6'); // Pink highlight

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Reflection
          ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
          ctx.beginPath();
          ctx.roundRect(x, height - 35, barWidth, barHeight * 0.2, [0, 0, 2, 2]);
          ctx.fill();
        }
      } else if (visualMode === 'circular') {
        // Circular Audio Pulse
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(width, height) * 0.22;

        ctx.save();
        ctx.translate(centerX, centerY);

        const segments = 64;
        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const value = data[i % data.length] || 0;
          const length = (value / 255) * 85;

          const x1 = Math.cos(angle) * baseRadius;
          const y1 = Math.sin(angle) * baseRadius;
          const x2 = Math.cos(angle) * (baseRadius + length);
          const y2 = Math.sin(angle) * (baseRadius + length);

          ctx.strokeStyle = `hsl(${270 + (i / segments) * 60}, 85%, 65%)`; // Purple-magenta hue range
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = '#121212';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#a855f7';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.restore();
      } else if (visualMode === 'wave') {
        // Oscilloscope Neon Waveform
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#a855f7';

        const sliceWidth = width / data.length;
        let x = 0;

        for (let i = 0; i < data.length; i++) {
          const v = data[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisualizerOpen, visualMode, isPlaying]);

  if (!isVisualizerOpen) return null;

  return (
    <div className="fixed inset-0 top-16 bottom-24 left-0 sm:left-64 z-30 bg-[#0a0a0a]/95 backdrop-blur-xl flex flex-col select-none">
      {/* Visualizer Controls Header */}
      <div className="p-6 flex items-center justify-between z-20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-[#a855f7]" />
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Live Audio Spectrum</h2>
            <p className="text-xs text-[#a7a7a7]">{currentTrack?.title} • {currentTrack?.artist}</p>
          </div>
        </div>

        {/* Visual Modes Switcher */}
        <div className="flex items-center gap-2 bg-[#181818] p-1 rounded-lg border border-[#282828]">
          <button
            onClick={() => setVisualMode('bars')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              visualMode === 'bars' ? 'bg-[#a855f7] text-white shadow-md shadow-purple-500/30' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            Equalizer Bars
          </button>
          <button
            onClick={() => setVisualMode('circular')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              visualMode === 'circular' ? 'bg-[#a855f7] text-white shadow-md shadow-purple-500/30' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            Circular Pulse
          </button>
          <button
            onClick={() => setVisualMode('wave')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              visualMode === 'wave' ? 'bg-[#a855f7] text-white shadow-md shadow-purple-500/30' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            Neon Wave
          </button>
        </div>

        <button
          onClick={() => setIsVisualizerOpen(false)}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}
