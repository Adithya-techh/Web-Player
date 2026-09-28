import React from 'react';
import { X, Trash2, Play, Music, ListMusic } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { formatTime } from '../utils/formatters';

export default function QueueDrawer() {
  const { 
    isQueueOpen, 
    setIsQueueOpen, 
    currentTrack, 
    queue, 
    playTrack, 
    removeFromQueue, 
    clearQueue 
  } = useAudio();

  if (!isQueueOpen) return null;

  return (
    <aside className="w-80 bg-[#121212] border-l border-[#282828] h-full flex flex-col p-4 select-none z-30 shrink-0 text-[#b3b3b3]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#282828]">
        <div className="flex items-center gap-2 text-white font-bold">
          <ListMusic className="w-5 h-5 text-[#a855f7]" />
          <span>Queue</span>
        </div>
        <button
          onClick={() => setIsQueueOpen(false)}
          className="p-1 rounded-full hover:bg-[#282828] text-[#a7a7a7] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6">
        {/* Now Playing */}
        {currentTrack && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a7a7a7]">
              Now Playing
            </span>
            <div className="p-3 bg-[#242424] rounded-lg flex items-center gap-3 shadow border-l-2 border-[#a855f7]">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-12 h-12 rounded object-cover shadow"
              />
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-[#c084fc] truncate">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-[#a7a7a7] truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next In Queue */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a7a7a7]">
              Next In Queue ({queue.length})
            </span>
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-xs text-[#a7a7a7] hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {queue.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#757575] flex flex-col items-center gap-2">
              <Music className="w-8 h-8 opacity-40 text-[#a855f7]" />
              <span>Queue is empty</span>
              <span>Add songs with the + button on any track</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {queue.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => playTrack(track)}
                  className="group flex items-center justify-between p-2 rounded hover:bg-[#1a1a1a] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-[#c084fc]">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-[#a7a7a7] truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#a7a7a7] tabular-nums">
                      {formatTime(track.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(idx);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
