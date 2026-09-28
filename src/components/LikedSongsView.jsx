import React from 'react';
import { Play, Pause, Heart, Clock, Plus } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { formatTime } from '../utils/formatters';

export default function LikedSongsView() {
  const { 
    tracks, 
    likedSongIds, 
    currentTrack, 
    isPlaying, 
    playTrack, 
    togglePlay, 
    toggleLike,
    addToQueue
  } = useAudio();

  const likedTracks = tracks.filter(t => likedSongIds.includes(t.id));
  const isPlayingLiked = likedTracks.some(t => t.id === currentTrack?.id) && isPlaying;
  const totalDuration = likedTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  const handlePlayLiked = () => {
    if (likedTracks.length === 0) return;
    if (isPlayingLiked) {
      togglePlay();
    } else {
      playTrack(likedTracks[0], likedTracks);
    }
  };

  return (
    <div className="flex flex-col pb-32">
      {/* Hero Header */}
      <div className="p-8 pt-16 flex flex-col md:flex-row items-end gap-6 bg-gradient-to-b from-[#5038a0] to-[#121212] relative overflow-hidden">
        <div className="w-48 h-48 sm:w-56 sm:h-56 shadow-2xl rounded shrink-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-500 flex items-center justify-center">
          <Heart className="w-24 h-24 text-white fill-white shadow-lg" />
        </div>

        <div className="flex flex-col gap-2 z-10">
          <span className="text-xs uppercase font-extrabold tracking-wider text-white">
            Playlist
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
            Liked Songs
          </h1>

          <div className="flex items-center gap-2 text-xs font-semibold text-white/90 mt-4">
            <span className="font-bold text-white">Adithya</span>
            <span>•</span>
            <span>{likedTracks.length} songs,</span>
            <span className="text-[#b3b3b3]">about {totalMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-8 py-6 bg-[#121212] flex items-center gap-6">
        <button
          onClick={handlePlayLiked}
          disabled={likedTracks.length === 0}
          className="w-14 h-14 rounded-full bg-[#a855f7] hover:bg-[#9333ea] text-white flex items-center justify-center shadow-xl shadow-purple-500/40 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          title={isPlayingLiked ? "Pause" : "Play"}
        >
          {isPlayingLiked ? (
            <Pause className="w-7 h-7 fill-white text-white" />
          ) : (
            <Play className="w-7 h-7 fill-white text-white translate-x-0.5" />
          )}
        </button>
      </div>

      {/* Tracks Table */}
      <div className="px-8">
        {likedTracks.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#282828] flex items-center justify-center mb-4 text-[#a7a7a7]">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Songs you like will appear here</h3>
            <p className="text-sm text-[#a7a7a7]">Save songs by tapping the heart icon on any song.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#282828] text-xs font-semibold text-[#a7a7a7] tracking-wider uppercase">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4 hidden md:table-cell">Album</th>
                <th className="py-3 px-4 hidden sm:table-cell">Plays</th>
                <th className="py-3 px-4 w-12 text-center">
                  <Clock className="w-4 h-4 mx-auto" />
                </th>
                <th className="py-3 px-4 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {likedTracks.map((track, idx) => {
                const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
                const isCurrentActive = currentTrack?.id === track.id;

                return (
                  <tr
                    key={track.id}
                    onClick={() => playTrack(track, likedTracks)}
                    className="group hover:bg-[#282828]/60 rounded-md cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-center text-sm font-medium text-[#a7a7a7] w-12">
                      {isCurrentPlaying ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="sound-bar" />
                          <span className="sound-bar" />
                          <span className="sound-bar" />
                          <span className="sound-bar" />
                        </div>
                      ) : (
                        <>
                          <span className="group-hover:hidden">{idx + 1}</span>
                          <Play className="w-4 h-4 fill-white text-white mx-auto hidden group-hover:block" />
                        </>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-10 h-10 rounded object-cover shadow shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className={`text-sm font-semibold truncate ${
                            isCurrentActive ? 'text-[#c084fc]' : 'text-white'
                          }`}>
                            {track.title}
                          </p>
                          <p className="text-xs text-[#a7a7a7] truncate group-hover:text-white">
                            {track.artist}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 hidden md:table-cell text-xs text-[#a7a7a7] group-hover:text-white truncate">
                      {track.album}
                    </td>

                    <td className="py-3 px-4 hidden sm:table-cell text-xs text-[#a7a7a7] tabular-nums">
                      {track.plays}
                    </td>

                    <td className="py-3 px-4 text-center text-xs text-[#a7a7a7] tabular-nums">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track.id);
                          }}
                          className="p-1"
                        >
                          <Heart className="w-4 h-4 fill-[#a855f7] text-[#a855f7]" />
                        </button>
                        <span>{formatTime(track.duration)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(track);
                          alert(`Added "${track.title}" to Queue!`);
                        }}
                        className="p-1 text-[#a7a7a7] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Add to queue"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
