import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Heart, 
  Mic2, 
  ListMusic, 
  Activity, 
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { formatTime } from '../utils/formatters';

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    seekTo,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleShuffle,
    cycleRepeat,
    toggleLike,
    isLiked,
    isLyricsOpen,
    setIsLyricsOpen,
    isVisualizerOpen,
    setIsVisualizerOpen,
    isQueueOpen,
    setIsQueueOpen
  } = useAudio();

  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [isHoveringVolume, setIsHoveringVolume] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!currentTrack) return null;

  const currentLiked = isLiked(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-5 h-5 text-[#b3b3b3] hover:text-white" />;
    if (volume < 0.5) return <Volume1 className="w-5 h-5 text-[#b3b3b3] hover:text-white" />;
    return <Volume2 className="w-5 h-5 text-[#b3b3b3] hover:text-white" />;
  };

  return (
    <footer className="h-24 bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between z-40 select-none">
      {/* LEFT: Current Track Info */}
      <div className="flex items-center gap-3 w-[30%] min-w-[180px]">
        <img
          src={currentTrack.coverUrl}
          alt={currentTrack.title}
          className="w-14 h-14 rounded object-cover shadow-md shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setIsLyricsOpen(!isLyricsOpen)}
        />
        <div className="overflow-hidden flex flex-col justify-center">
          <p 
            onClick={() => setIsLyricsOpen(!isLyricsOpen)}
            className="text-sm font-semibold text-white truncate hover:underline cursor-pointer"
          >
            {currentTrack.title}
          </p>
          <p className="text-xs text-[#b3b3b3] truncate hover:text-white hover:underline cursor-pointer">
            {currentTrack.artist}
          </p>
        </div>
        <button
          onClick={() => toggleLike(currentTrack.id)}
          className="p-1 text-[#b3b3b3] hover:text-white transition-colors ml-1 shrink-0"
          title={currentLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
        >
          <Heart 
            className={`w-5 h-5 transition-transform active:scale-125 ${
              currentLiked ? 'fill-[#a855f7] text-[#a855f7]' : 'hover:text-white'
            }`} 
          />
        </button>
      </div>

      {/* CENTER: Player Controls & Scrubber */}
      <div className="flex flex-col items-center gap-1.5 max-w-[722px] w-[40%]">
        {/* Buttons */}
        <div className="flex items-center gap-4">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-1.5 transition-colors relative ${
              isShuffle ? 'text-[#a855f7]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={isShuffle ? "Disable shuffle" : "Enable shuffle"}
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && (
              <span className="w-1 h-1 bg-[#a855f7] rounded-full absolute bottom-0 left-1/2 -translate-x-1/2" />
            )}
          </button>

          {/* Previous Track */}
          <button
            onClick={prevTrack}
            className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors"
            title="Previous track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black translate-x-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors"
            title="Next track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeat}
            className={`p-1.5 transition-colors relative ${
              repeatMode !== 'off' ? 'text-[#a855f7]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== 'off' && (
              <span className="w-1 h-1 bg-[#a855f7] rounded-full absolute bottom-0 left-1/2 -translate-x-1/2" />
            )}
          </button>
        </div>

        {/* Progress Bar / Scrubber */}
        <div 
          className="w-full flex items-center gap-2 group"
          onMouseEnter={() => setIsHoveringSeek(true)}
          onMouseLeave={() => setIsHoveringSeek(false)}
        >
          <span className="text-[11px] text-[#a7a7a7] w-8 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 flex items-center h-4 cursor-pointer">
            {/* Background track */}
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden relative">
              {/* Filled progress bar */}
              <div
                className={`h-full rounded-full transition-colors ${
                  isHoveringSeek ? 'bg-[#a855f7]' : 'bg-white'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Invisible Range Input on top */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <span className="text-[11px] text-[#a7a7a7] w-8 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* RIGHT: Tools, Volume & Fullscreen */}
      <div className="flex items-center justify-end gap-3 w-[30%] min-w-[180px]">
        {/* Real-time Lyrics */}
        <button
          onClick={() => setIsLyricsOpen(!isLyricsOpen)}
          className={`p-1.5 transition-colors rounded-full ${
            isLyricsOpen ? 'text-[#a855f7] bg-[#282828]' : 'text-[#b3b3b3] hover:text-white'
          }`}
          title="Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Queue Drawer */}
        <button
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          className={`p-1.5 transition-colors rounded-full ${
            isQueueOpen ? 'text-[#a855f7] bg-[#282828]' : 'text-[#b3b3b3] hover:text-white'
          }`}
          title="Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Audio Visualizer */}
        <button
          onClick={() => setIsVisualizerOpen(!isVisualizerOpen)}
          className={`p-1.5 transition-colors rounded-full ${
            isVisualizerOpen ? 'text-[#a855f7] bg-[#282828]' : 'text-[#b3b3b3] hover:text-white'
          }`}
          title="Live Audio Visualizer"
        >
          <Activity className="w-4 h-4" />
        </button>

        {/* Volume Controls */}
        <div 
          className="flex items-center gap-2 group w-32"
          onMouseEnter={() => setIsHoveringVolume(true)}
          onMouseLeave={() => setIsHoveringVolume(false)}
        >
          <button onClick={toggleMute} className="shrink-0 p-1">
            {getVolumeIcon()}
          </button>

          <div className="relative flex-1 flex items-center h-4 cursor-pointer">
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-colors ${
                  isHoveringVolume ? 'bg-[#a855f7]' : 'bg-white'
                }`}
                style={{ width: `${volumePercent}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors"
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </footer>
  );
}
