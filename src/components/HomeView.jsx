import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { getGreeting } from '../utils/formatters';

export default function HomeView() {
  const { 
    tracks, 
    playlists, 
    likedSongIds, 
    currentTrack, 
    isPlaying, 
    playTrack, 
    togglePlay, 
    setCurrentView, 
    setSelectedPlaylistId 
  } = useAudio();

  const greeting = getGreeting();

  // Top 6 cards for the quick access grid
  const topSixItems = [
    {
      id: 'liked-shortcut',
      title: 'Liked Songs',
      coverUrl: null, // special gradient
      isLiked: true,
      onClick: () => setCurrentView('liked')
    },
    ...playlists.slice(0, 5).map(p => ({
      id: p.id,
      title: p.title,
      coverUrl: p.coverUrl,
      playlist: p,
      onClick: () => {
        setSelectedPlaylistId(p.id);
        setCurrentView('playlist');
      }
    }))
  ];

  const handlePlayPlaylist = (e, playlist) => {
    e.stopPropagation();
    const playlistTracks = tracks.filter(t => playlist.trackIds.includes(t.id));
    if (playlistTracks.length > 0) {
      if (currentTrack && playlistTracks.some(t => t.id === currentTrack.id)) {
        togglePlay();
      } else {
        playTrack(playlistTracks[0], playlistTracks, { type: 'playlist', id: playlist.id });
      }
    }
  };

  const handlePlaySong = (e, song) => {
    e.stopPropagation();
    if (currentTrack && currentTrack.id === song.id) {
      togglePlay();
    } else {
      playTrack(song, tracks);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-8 pb-32">
      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <button className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold rounded-full shadow-md shadow-purple-500/20">
          All
        </button>
        <button className="px-4 py-1.5 bg-[#282828] text-white hover:bg-[#333333] text-sm font-semibold rounded-full transition-colors">
          Music
        </button>
        <button className="px-4 py-1.5 bg-[#282828] text-white hover:bg-[#333333] text-sm font-semibold rounded-full transition-colors">
          Podcasts
        </button>
      </div>

      {/* Greeting & Top 6 Quick Cards */}
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{greeting}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topSixItems.map((item) => {
            const isPlayingThis = item.playlist && 
              tracks.filter(t => item.playlist.trackIds.includes(t.id)).some(t => t.id === currentTrack?.id) && 
              isPlaying;

            return (
              <div
                key={item.id}
                onClick={item.onClick}
                className="group relative flex items-center bg-[#282828]/60 hover:bg-[#333333] rounded overflow-hidden cursor-pointer transition-all duration-200 pr-4 shadow-sm hover:shadow-md"
              >
                {/* Artwork */}
                {item.isLiked ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-800 via-violet-700 to-fuchsia-600 flex items-center justify-center shrink-0 shadow">
                    <Heart className="w-8 h-8 text-white fill-white" />
                  </div>
                ) : (
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover shrink-0 shadow"
                  />
                )}

                {/* Title */}
                <div className="px-4 flex-1 overflow-hidden">
                  <span className="font-bold text-sm text-white line-clamp-2">
                    {item.title}
                  </span>
                </div>

                {/* Floating Play Button on Hover - Purple */}
                {item.playlist && (
                  <button
                    onClick={(e) => handlePlayPlaylist(e, item.playlist)}
                    className={`w-11 h-11 rounded-full bg-[#a855f7] hover:bg-[#9333ea] text-white flex items-center justify-center shadow-xl shadow-purple-500/30 transition-all duration-200 shrink-0 ${
                      isPlayingThis 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95'
                    }`}
                    title="Play"
                  >
                    {isPlayingThis ? (
                      <Pause className="w-5 h-5 fill-white text-white" />
                    ) : (
                      <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Playlists */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight hover:underline cursor-pointer">
            Featured Playlists
          </h2>
          <span 
            onClick={() => setCurrentView('library')}
            className="text-xs font-bold text-[#b3b3b3] hover:text-[#c084fc] hover:underline cursor-pointer"
          >
            Show all
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {playlists.map((playlist) => {
            const isPlayingThis = 
              tracks.filter(t => playlist.trackIds.includes(t.id)).some(t => t.id === currentTrack?.id) && 
              isPlaying;

            return (
              <div
                key={playlist.id}
                onClick={() => {
                  setSelectedPlaylistId(playlist.id);
                  setCurrentView('playlist');
                }}
                className="group p-4 bg-[#181818] hover:bg-[#282828] rounded-lg cursor-pointer transition-all duration-300 flex flex-col gap-3 relative shadow-md hover:shadow-xl"
              >
                {/* Cover Image & Floating Play button */}
                <div className="relative aspect-square w-full overflow-hidden rounded shadow-lg">
                  <img
                    src={playlist.coverUrl}
                    alt={playlist.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => handlePlayPlaylist(e, playlist)}
                    className={`absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#a855f7] hover:bg-[#9333ea] text-white flex items-center justify-center shadow-xl shadow-purple-500/30 transition-all duration-200 ${
                      isPlayingThis
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95'
                    }`}
                    title="Play"
                  >
                    {isPlayingThis ? (
                      <Pause className="w-5 h-5 fill-white text-white" />
                    ) : (
                      <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                    )}
                  </button>
                </div>

                {/* Info */}
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-white truncate">
                    {playlist.title}
                  </span>
                  <span className="text-xs text-[#a7a7a7] line-clamp-2 mt-1 leading-relaxed">
                    {playlist.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fresh Music Catalog */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight hover:underline cursor-pointer">
            Today's Fresh Releases
          </h2>
          <span 
            onClick={() => setCurrentView('search')}
            className="text-xs font-bold text-[#b3b3b3] hover:text-[#c084fc] hover:underline cursor-pointer"
          >
            Explore all
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tracks.slice(0, 6).map((track) => {
            const isPlayingThis = currentTrack?.id === track.id && isPlaying;

            return (
              <div
                key={track.id}
                onClick={(e) => handlePlaySong(e, track)}
                className="group p-4 bg-[#181818] hover:bg-[#282828] rounded-lg cursor-pointer transition-all duration-300 flex flex-col gap-3 relative shadow-md hover:shadow-xl"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded shadow-lg">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => handlePlaySong(e, track)}
                    className={`absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#a855f7] hover:bg-[#9333ea] text-white flex items-center justify-center shadow-xl shadow-purple-500/30 transition-all duration-200 ${
                      isPlayingThis
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95'
                    }`}
                    title="Play"
                  >
                    {isPlayingThis ? (
                      <Pause className="w-5 h-5 fill-white text-white" />
                    ) : (
                      <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                    )}
                  </button>
                </div>

                <div className="flex flex-col">
                  <span className={`font-bold text-sm truncate ${isPlayingThis ? 'text-[#c084fc]' : 'text-white'}`}>
                    {track.title}
                  </span>
                  <span className="text-xs text-[#a7a7a7] truncate mt-1">
                    {track.artist}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
