import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  Clock, 
  Trash2, 
  Plus, 
  Music, 
  Loader2,
  RefreshCw,
  ExternalLink 
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { formatTime } from '../utils/formatters';

export default function PlaylistView() {
  const { 
    playlists, 
    selectedPlaylistId, 
    tracks, 
    currentTrack, 
    isPlaying, 
    playTrack, 
    togglePlay, 
    toggleLike, 
    isLiked, 
    removeTrackFromPlaylist,
    addTrackToPlaylist,
    deletePlaylist,
    addToQueue,
    loadSpotifyPlaylistTracks,
    refreshPlaylistTracks,
    isSyncingSpotify
  } = useAudio();

  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const playlist = playlists.find(p => p.id === selectedPlaylistId);

  // If this is a Spotify playlist and we haven't loaded its tracks yet, load them!
  useEffect(() => {
    if (playlist && playlist.isSpotify) {
      const existingCount = tracks.filter(t => playlist.trackIds?.includes(t.id)).length;
      if (existingCount === 0) {
        setIsLoadingTracks(true);
        loadSpotifyPlaylistTracks(playlist.id).finally(() => {
          setIsLoadingTracks(false);
        });
      }
    }
  }, [playlist?.id]);

  if (!playlist) {
    return (
      <div className="p-8 text-center text-[#b3b3b3]">
        <p>Playlist not found.</p>
      </div>
    );
  }

  // Get tracks belonging to this playlist
  const playlistTracks = tracks.filter(t => playlist.trackIds?.includes(t.id));
  const isPlayingCurrentPlaylist = 
    playlistTracks.some(t => t.id === currentTrack?.id) && isPlaying;
  
  const totalDuration = playlistTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  const isCustom = playlist.id.startsWith('playlist-custom-');

  const handlePlayPlaylist = () => {
    if (playlistTracks.length === 0) return;
    if (isPlayingCurrentPlaylist) {
      togglePlay();
    } else {
      playTrack(playlistTracks[0], playlistTracks, { type: 'playlist', id: playlist.id });
    }
  };

  const handleRefreshSpotifyTracks = () => {
    if (playlist.isSpotify) {
      setIsLoadingTracks(true);
      refreshPlaylistTracks(playlist.id).finally(() => {
        setIsLoadingTracks(false);
      });
    }
  };

  return (
    <div className="flex flex-col pb-32">
      {/* Hero Header with dynamic gradient */}
      <div 
        className="p-8 pt-16 flex flex-col md:flex-row items-end gap-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${playlist.color || '#a855f7'} 0%, #121212 100%)`
        }}
      >
        {/* Cover Art */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 shadow-2xl rounded shrink-0 overflow-hidden bg-[#282828] flex items-center justify-center">
          {playlist.coverUrl ? (
            <img 
              src={playlist.coverUrl} 
              alt={playlist.title} 
              className="w-full h-full object-cover shadow-2xl"
            />
          ) : (
            <Music className="w-20 h-20 text-[#a7a7a7]" />
          )}
        </div>

        {/* Playlist Meta Details */}
        <div className="flex flex-col gap-2 z-10">
          <span className="text-xs uppercase font-extrabold tracking-wider text-white flex items-center gap-2">
            {playlist.isSpotify ? (
              <span className="bg-[#a855f7] text-white px-2 py-0.5 rounded-full text-[10px] font-black shadow-md shadow-purple-500/30">
                Live Playlist
              </span>
            ) : isCustom ? (
              "Custom Playlist"
            ) : (
              "Public Playlist"
            )}
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
            {playlist.title}
          </h1>
          <p className="text-sm text-[#b3b3b3] mt-2 max-w-2xl leading-relaxed">
            {playlist.description}
          </p>

          <div className="flex items-center gap-2 text-xs font-semibold text-white/90 mt-2">
            <div className="w-5 h-5 rounded-full bg-[#a855f7] text-white font-extrabold flex items-center justify-center text-[10px]">
              W
            </div>
            <span className="font-bold">Web Player</span>
            <span>•</span>
            <span>{playlist.followers || '1'} saves</span>
            <span>•</span>
            <span>{playlistTracks.length} songs,</span>
            <span className="text-[#b3b3b3]">about {totalMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-8 py-6 bg-[#121212] flex items-center gap-4 sm:gap-6 flex-wrap">
        <button
          onClick={handlePlayPlaylist}
          disabled={playlistTracks.length === 0}
          className="w-14 h-14 rounded-full bg-[#a855f7] hover:bg-[#9333ea] text-white flex items-center justify-center shadow-xl shadow-purple-500/40 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          title={isPlayingCurrentPlaylist ? "Pause" : "Play"}
        >
          {isPlayingCurrentPlaylist ? (
            <Pause className="w-7 h-7 fill-white text-white" />
          ) : (
            <Play className="w-7 h-7 fill-white text-white translate-x-0.5" />
          )}
        </button>

        {/* Sync Tracks button for Spotify playlists */}
        {playlist.isSpotify && (
          <button
            onClick={handleRefreshSpotifyTracks}
            disabled={isLoadingTracks || isSyncingSpotify}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#242424] hover:bg-[#333333] text-xs font-bold text-white transition-colors border border-white/10"
            title="Fetch latest tracks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTracks ? 'animate-spin text-[#a855f7]' : ''}`} />
            <span>{isLoadingTracks ? 'Syncing...' : 'Sync Latest Tracks'}</span>
          </button>
        )}

        {isCustom && (
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${playlist.title}"?`)) {
                deletePlaylist(playlist.id);
              }
            }}
            className="p-2 text-[#a7a7a7] hover:text-red-400 transition-colors"
            title="Delete Playlist"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Tracks Table */}
      <div className="px-8">
        {isLoadingTracks ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="w-8 h-8 text-[#a855f7] animate-spin" />
            <p className="text-sm text-[#b3b3b3]">Syncing tracks...</p>
          </div>
        ) : playlistTracks.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center bg-[#181818]/40 rounded-xl border border-dashed border-[#282828] p-6">
            <Music className="w-12 h-12 text-[#535353] mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">It's a bit empty here</h3>
            <p className="text-sm text-[#a7a7a7] mb-6">Find and add more songs to your playlist!</p>
            
            <div className="w-full max-w-xl text-left">
              <h4 className="text-sm font-bold text-white mb-3">Recommended Songs</h4>
              <div className="flex flex-col gap-2">
                {tracks.slice(0, 4).map((recTrack) => (
                  <div key={recTrack.id} className="flex items-center justify-between p-2 rounded hover:bg-[#282828]">
                    <div className="flex items-center gap-3">
                      <img src={recTrack.coverUrl} alt={recTrack.title} className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="text-sm font-semibold text-white">{recTrack.title}</p>
                        <p className="text-xs text-[#a7a7a7]">{recTrack.artist}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => addTrackToPlaylist(playlist.id, recTrack.id)}
                      className="px-3 py-1 border border-[#a7a7a7] hover:border-white text-xs font-bold rounded-full text-white transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
              {playlistTracks.map((track, idx) => {
                const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
                const isCurrentActive = currentTrack?.id === track.id;
                const liked = isLiked(track.id);

                return (
                  <tr
                    key={track.id}
                    onClick={() => playTrack(track, playlistTracks, { type: 'playlist', id: playlist.id })}
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
                          className="text-[#a7a7a7] hover:text-white p-1"
                        >
                          <Heart className={`w-4 h-4 ${
                            liked ? 'fill-[#a855f7] text-[#a855f7]' : 'opacity-0 group-hover:opacity-100'
                          }`} />
                        </button>
                        <span>{formatTime(track.duration)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(track);
                        }}
                        className="p-1 text-[#a7a7a7] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Add to queue"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      {isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTrackFromPlaylist(playlist.id, track.id);
                          }}
                          className="p-1 text-[#a7a7a7] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
