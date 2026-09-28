import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X, 
  Upload, 
  User, 
  LogIn, 
  Loader2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function Navbar() {
  const { 
    currentView, 
    setCurrentView, 
    searchQuery, 
    setSearchQuery, 
    setIsUploadOpen,
    setIsCreatePlaylistOpen,
    setIsSpotifyModalOpen,
    spotifyUser,
    isSpotifyAuth,
    isSyncingSpotify
  } = useAudio();

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-30 bg-[#121212]/90 backdrop-blur-md border-b border-[#282828]/40 transition-colors">
      {/* Left: Nav arrows & Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentView('home')}
            className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors"
            title="Go to Home"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentView('search')}
            className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors"
            title="Go to Search"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#b3b3b3]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={isSpotifyAuth ? "Search songs, artists, playlists..." : "What do you want to play?"}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentView !== 'search') setCurrentView('search');
            }}
            onFocus={() => {
              if (currentView !== 'search') setCurrentView('search');
            }}
            className="w-full pl-9 pr-9 py-2 bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-sm text-white placeholder-[#757575] rounded-full border border-transparent focus:border-[#a855f7]/50 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b3b3b3] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions & Account */}
      <div className="flex items-center gap-3">
        {/* Syncing indicator */}
        {isSyncingSpotify && (
          <div className="flex items-center gap-1.5 text-xs text-[#a855f7] animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="hidden md:inline font-semibold">Syncing library...</span>
          </div>
        )}

        <button
          onClick={() => setIsUploadOpen(true)}
          className="hidden lg:flex items-center gap-2 text-xs font-bold text-white bg-[#282828] hover:bg-[#333333] px-3.5 py-2 rounded-full transition-transform active:scale-95"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import Songs</span>
        </button>

        <button 
          onClick={() => setIsCreatePlaylistOpen(true)}
          className="hidden sm:inline-flex text-xs font-bold text-black bg-white hover:bg-white/90 px-4 py-2 rounded-full transition-transform active:scale-95 shadow-md hover:scale-105"
        >
          + Playlist
        </button>

        {/* Account Status / Login Button */}
        {isSpotifyAuth && spotifyUser ? (
          <div 
            onClick={() => setIsSpotifyModalOpen(true)}
            className="flex items-center gap-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] p-1 pl-1 pr-3 rounded-full cursor-pointer transition-colors border border-[#a855f7]/40 shadow-md group"
            title="Manage Connected Account"
          >
            {spotifyUser.images?.[0]?.url ? (
              <img
                src={spotifyUser.images[0].url}
                alt={spotifyUser.display_name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-[#a855f7]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#a855f7] text-white font-extrabold text-xs flex items-center justify-center">
                {spotifyUser.display_name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight truncate max-w-[100px] group-hover:text-[#c084fc]">
                {spotifyUser.display_name}
              </span>
              <span className="text-[10px] text-[#a855f7] font-semibold leading-none">Connected</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsSpotifyModalOpen(true)}
            className="flex items-center gap-2 text-xs font-extrabold text-white bg-[#a855f7] hover:bg-[#9333ea] px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25"
          >
            <User className="w-4 h-4 text-white" />
            <span>Connect Account</span>
          </button>
        )}
      </div>
    </header>
  );
}
