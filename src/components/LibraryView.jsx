import React, { useState } from 'react';
import { 
  Plus, 
  Heart, 
  Music, 
  Upload, 
  FolderPlus, 
  Grid, 
  List as ListIcon 
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function LibraryView() {
  const { 
    playlists, 
    likedSongIds, 
    tracks, 
    setCurrentView, 
    setSelectedPlaylistId,
    setIsCreatePlaylistOpen,
    setIsUploadOpen 
  } = useAudio();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'playlists' | 'liked' | 'local'

  const localTracks = tracks.filter(t => t.isLocal);

  return (
    <div className="p-6 flex flex-col gap-6 pb-32">
      {/* Title & Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Library</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#282828] hover:bg-[#333333] text-white text-xs font-bold rounded-full transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Songs</span>
          </button>
          <button
            onClick={() => setIsCreatePlaylistOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-white text-black hover:bg-white/90 text-xs font-bold rounded-full transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            activeFilter === 'all' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter('playlists')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            activeFilter === 'playlists' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
          }`}
        >
          Playlists
        </button>
        <button
          onClick={() => setActiveFilter('liked')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            activeFilter === 'liked' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
          }`}
        >
          Liked Songs
        </button>
        <button
          onClick={() => setActiveFilter('local')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            activeFilter === 'local' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
          }`}
        >
          Local Files ({localTracks.length})
        </button>
      </div>

      {/* Library Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {/* Create Playlist Shortcut */}
        {(activeFilter === 'all' || activeFilter === 'playlists') && (
          <div
            onClick={() => setIsCreatePlaylistOpen(true)}
            className="group p-4 bg-[#181818]/60 hover:bg-[#282828] border border-dashed border-[#333333] hover:border-white/50 rounded-lg cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center aspect-square gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-[#282828] group-hover:bg-[#a855f7] group-hover:text-white text-white flex items-center justify-center transition-colors shadow-md group-hover:shadow-purple-500/30">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">Create playlist</span>
              <span className="text-xs text-[#a7a7a7]">Easy and fast</span>
            </div>
          </div>
        )}

        {/* Liked Songs Tile */}
        {(activeFilter === 'all' || activeFilter === 'liked') && (
          <div
            onClick={() => setCurrentView('liked')}
            className="group p-4 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-[#181818] hover:brightness-110 rounded-lg cursor-pointer transition-all duration-300 flex flex-col justify-between aspect-square relative shadow-md"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center shadow">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white block">Liked Songs</span>
              <span className="text-xs text-[#b3b3b3] mt-1 block">
                {likedSongIds.length} liked songs
              </span>
            </div>
          </div>
        )}

        {/* Playlists */}
        {(activeFilter === 'all' || activeFilter === 'playlists') &&
          playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => {
                setSelectedPlaylistId(playlist.id);
                setCurrentView('playlist');
              }}
              className="group p-4 bg-[#181818] hover:bg-[#282828] rounded-lg cursor-pointer transition-all duration-300 flex flex-col gap-3 relative shadow-md"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded shadow-lg">
                <img
                  src={playlist.coverUrl}
                  alt={playlist.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white truncate">
                  {playlist.title}
                </span>
                <span className="text-xs text-[#a7a7a7] truncate mt-1">
                  Playlist • {playlist.trackIds.length} tracks
                </span>
              </div>
            </div>
          ))}

        {/* Local Files Tab */}
        {(activeFilter === 'local' || (activeFilter === 'all' && localTracks.length > 0)) &&
          localTracks.map((track) => (
            <div
              key={track.id}
              className="group p-4 bg-[#181818] hover:bg-[#282828] rounded-lg cursor-pointer transition-all duration-300 flex flex-col gap-3 relative shadow-md"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded shadow-lg bg-[#242424] flex items-center justify-center">
                <Music className="w-12 h-12 text-[#a855f7]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white truncate">
                  {track.title}
                </span>
                <span className="text-xs text-[#a7a7a7] truncate mt-1">
                  {track.artist} (Local)
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
