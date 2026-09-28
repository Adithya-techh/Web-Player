import React from 'react';
import { 
  Home, 
  Search, 
  Library, 
  Plus, 
  Heart, 
  Music, 
  FolderPlus, 
  Upload, 
  Disc, 
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function Sidebar() {
  const { 
    currentView, 
    setCurrentView, 
    playlists, 
    selectedPlaylistId, 
    setSelectedPlaylistId,
    likedSongIds,
    setIsCreatePlaylistOpen,
    setIsUploadOpen,
    deletePlaylist,
    isSpotifyAuth,
    isSyncingSpotify,
    refreshSpotifyLibrary
  } = useAudio();

  const handleSelectPlaylist = (id) => {
    setSelectedPlaylistId(id);
    setCurrentView('playlist');
  };

  return (
    <aside className="w-64 bg-black h-full flex flex-col gap-2 p-2 select-none z-20 shrink-0 text-[#b3b3b3]">
      {/* Top Nav Box */}
      <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-5">
        {/* Brand Logo - Web Player */}
        <div 
          onClick={() => { setCurrentView('home'); setSelectedPlaylistId(null); }}
          className="flex items-center gap-2.5 text-white font-bold text-xl cursor-pointer hover:opacity-95 transition-opacity px-2"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9333ea] to-[#c084fc] flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg className="w-4 h-4 text-white fill-current translate-x-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <span className="tracking-tight text-lg font-extrabold bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
            Web Player
          </span>
        </div>

        {/* Home & Search links */}
        <nav className="flex flex-col gap-1 font-semibold text-sm">
          <button
            onClick={() => { setCurrentView('home'); setSelectedPlaylistId(null); }}
            className={`flex items-center gap-4 px-3 py-2 rounded-md transition-colors ${
              currentView === 'home' && !selectedPlaylistId
                ? 'text-white bg-[#282828]/50'
                : 'hover:text-white'
            }`}
          >
            <Home className="w-6 h-6" />
            <span>Home</span>
          </button>

          <button
            onClick={() => { setCurrentView('search'); setSelectedPlaylistId(null); }}
            className={`flex items-center gap-4 px-3 py-2 rounded-md transition-colors ${
              currentView === 'search'
                ? 'text-white bg-[#282828]/50'
                : 'hover:text-white'
            }`}
          >
            <Search className="w-6 h-6" />
            <span>Search</span>
          </button>
        </nav>
      </div>

      {/* Library Box */}
      <div className="bg-[#121212] rounded-lg flex-1 flex flex-col p-2 overflow-hidden">
        {/* Library Header */}
        <div className="flex items-center justify-between px-3 py-3 text-sm font-semibold">
          <button 
            onClick={() => { setCurrentView('library'); setSelectedPlaylistId(null); }}
            className={`flex items-center gap-3 transition-colors ${
              currentView === 'library' ? 'text-white' : 'hover:text-white'
            }`}
          >
            <Library className="w-6 h-6" />
            <span>Your Library</span>
          </button>

          <div className="flex items-center gap-1">
            {/* Real-Time Sync Button */}
            {isSpotifyAuth && (
              <button
                onClick={refreshSpotifyLibrary}
                disabled={isSyncingSpotify}
                title="Sync latest playlists"
                className="p-1.5 rounded-full hover:bg-[#282828] hover:text-[#a855f7] transition-colors text-[#b3b3b3]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSpotify ? 'animate-spin text-[#a855f7]' : ''}`} />
              </button>
            )}

            <button
              onClick={() => setIsUploadOpen(true)}
              title="Import local music files"
              className="p-1.5 rounded-full hover:bg-[#282828] hover:text-white transition-colors text-[#b3b3b3]"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCreatePlaylistOpen(true)}
              title="Create new playlist"
              className="p-1.5 rounded-full hover:bg-[#282828] hover:text-white transition-colors text-[#b3b3b3]"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-3 pb-2 text-xs">
          <button 
            onClick={() => setCurrentView('library')}
            className="px-3 py-1 bg-[#242424] hover:bg-[#2a2a2a] text-white rounded-full font-medium transition-colors"
          >
            Playlists
          </button>
          {isSpotifyAuth && (
            <span className="text-[10px] text-[#a855f7] font-semibold flex items-center gap-1 ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse" />
              Live Sync
            </span>
          )}
        </div>

        {/* Scrollable Playlist List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 mt-1">
          {/* Liked Songs Entry */}
          <div
            onClick={() => {
              setCurrentView('liked');
              setSelectedPlaylistId(null);
            }}
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
              currentView === 'liked' ? 'bg-[#282828] text-white' : 'hover:bg-[#1a1a1a]'
            }`}
          >
            <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-800 via-violet-700 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-md">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">Liked Songs</p>
              <p className="text-xs text-[#a7a7a7] flex items-center gap-1">
                <span>Playlist</span>
                <span>•</span>
                <span>{likedSongIds.length} songs</span>
              </p>
            </div>
          </div>

          {/* User & Curated Playlists */}
          {playlists.map((playlist) => {
            const isSelected = currentView === 'playlist' && selectedPlaylistId === playlist.id;
            const isCustom = playlist.id.startsWith('playlist-custom-');

            return (
              <div
                key={playlist.id}
                onClick={() => handleSelectPlaylist(playlist.id)}
                className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#282828] text-white' : 'hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={playlist.coverUrl}
                    alt={playlist.title}
                    className="w-12 h-12 rounded object-cover shrink-0 shadow-sm"
                  />
                  <div className="overflow-hidden">
                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-[#a855f7]' : 'text-white'}`}>
                      {playlist.title}
                    </p>
                    <p className="text-xs text-[#a7a7a7] truncate flex items-center gap-1">
                      {playlist.isSpotify && (
                        <span className="text-[10px] text-[#a855f7] font-bold">Live • </span>
                      )}
                      <span>{playlist.trackCount ? `${playlist.trackCount} tracks` : `${playlist.trackIds?.length || 0} tracks`}</span>
                    </p>
                  </div>
                </div>

                {isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete playlist "${playlist.title}"?`)) {
                        deletePlaylist(playlist.id);
                      }
                    }}
                    title="Delete playlist"
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-[#a7a7a7] hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
