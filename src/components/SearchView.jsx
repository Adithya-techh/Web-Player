import React from 'react';
import { Play, Pause, Heart, Music, Search as SearchIcon } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { GENRE_CATEGORIES } from '../data/musicData';
import { formatTime } from '../utils/formatters';

export default function SearchView() {
  const { 
    tracks, 
    playlists, 
    searchQuery, 
    setSearchQuery, 
    selectedGenre, 
    setSelectedGenre, 
    currentTrack, 
    isPlaying, 
    playTrack, 
    togglePlay, 
    toggleLike, 
    isLiked,
    setSelectedPlaylistId,
    setCurrentView
  } = useAudio();

  // Filter tracks and playlists
  const cleanQuery = searchQuery.trim().toLowerCase();

  const filteredTracks = tracks.filter(track => {
    if (selectedGenre && track.genre.toLowerCase() !== selectedGenre.toLowerCase()) {
      return false;
    }
    if (!cleanQuery) return true;
    return (
      track.title.toLowerCase().includes(cleanQuery) ||
      track.artist.toLowerCase().includes(cleanQuery) ||
      track.album.toLowerCase().includes(cleanQuery) ||
      track.genre.toLowerCase().includes(cleanQuery)
    );
  });

  const filteredPlaylists = playlists.filter(playlist => {
    if (!cleanQuery) return true;
    return (
      playlist.title.toLowerCase().includes(cleanQuery) ||
      playlist.description.toLowerCase().includes(cleanQuery)
    );
  });

  const topResult = filteredTracks.length > 0 ? filteredTracks[0] : null;

  return (
    <div className="p-6 flex flex-col gap-8 pb-32">
      {/* Selected Genre Pill if active */}
      {selectedGenre && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#b3b3b3]">Filtering by genre:</span>
          <div className="flex items-center gap-2 bg-[#282828] text-white px-3 py-1 rounded-full text-sm font-semibold">
            <span>{selectedGenre}</span>
            <button 
              onClick={() => setSelectedGenre(null)} 
              className="text-[#b3b3b3] hover:text-white ml-1 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* When Search Query is present or Genre is selected */}
      {(cleanQuery || selectedGenre) ? (
        <div className="flex flex-col gap-8">
          {filteredTracks.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <SearchIcon className="w-16 h-16 text-[#535353] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No results found for "{searchQuery}"</h3>
              <p className="text-sm text-[#a7a7a7] max-w-md">
                Please make sure your words are spelled correctly, or use fewer or different keywords.
              </p>
            </div>
          ) : (
            <>
              {/* Top Result & Songs Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Top Result Card */}
                {topResult && (
                  <div className="lg:col-span-5 flex flex-col gap-3">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Top result</h2>
                    <div 
                      onClick={() => playTrack(topResult, filteredTracks)}
                      className="group p-5 bg-[#181818] hover:bg-[#282828] rounded-xl cursor-pointer transition-all duration-300 relative flex flex-col justify-between h-[230px] shadow-lg"
                    >
                      <div className="flex flex-col gap-4">
                        <img
                          src={topResult.coverUrl}
                          alt={topResult.title}
                          className="w-24 h-24 rounded-lg object-cover shadow-lg"
                        />
                        <div>
                          <h3 className="text-2xl font-extrabold text-white truncate group-hover:underline">
                            {topResult.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-[#b3b3b3]">{topResult.artist}</span>
                            <span className="px-2 py-0.5 bg-black/40 text-xs font-bold uppercase rounded-full text-white/90">
                              Song
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Play Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentTrack?.id === topResult.id) {
                            togglePlay();
                          } else {
                            playTrack(topResult, filteredTracks);
                          }
                        }}
                        className={`absolute bottom-5 right-5 w-12 h-12 rounded-full bg-[#a855f7] hover:bg-[#9333ea] text-white flex items-center justify-center shadow-2xl shadow-purple-500/40 transition-all duration-200 ${
                          currentTrack?.id === topResult.id && isPlaying
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {currentTrack?.id === topResult.id && isPlaying ? (
                          <Pause className="w-6 h-6 fill-white text-white" />
                        ) : (
                          <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Songs list */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Songs</h2>
                  <div className="flex flex-col">
                    {filteredTracks.slice(0, 4).map((track) => {
                      const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
                      const liked = isLiked(track.id);

                      return (
                        <div
                          key={track.id}
                          onClick={() => playTrack(track, filteredTracks)}
                          className="group flex items-center justify-between p-2 rounded-md hover:bg-[#282828]/60 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="relative w-11 h-11 rounded overflow-hidden shrink-0">
                              <img
                                src={track.coverUrl}
                                alt={track.title}
                                className="w-full h-full object-cover"
                              />
                              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                                isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}>
                                {isCurrentPlaying ? (
                                  <Pause className="w-4 h-4 fill-white text-white" />
                                ) : (
                                  <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                                )}
                              </div>
                            </div>

                            <div className="overflow-hidden">
                              <p className={`text-sm font-semibold truncate ${
                                currentTrack?.id === track.id ? 'text-[#c084fc]' : 'text-white'
                              }`}>
                                {track.title}
                              </p>
                              <p className="text-xs text-[#a7a7a7] truncate group-hover:text-white">
                                {track.artist}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(track.id);
                              }}
                              className="text-[#a7a7a7] hover:text-white"
                            >
                              <Heart className={`w-4 h-4 ${liked ? 'fill-[#a855f7] text-[#a855f7]' : 'opacity-0 group-hover:opacity-100'}`} />
                            </button>
                            <span className="text-xs text-[#a7a7a7] tabular-nums">
                              {formatTime(track.duration)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Playlists matches */}
              {filteredPlaylists.length > 0 && (
                <section className="flex flex-col gap-4 mt-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Playlists</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredPlaylists.map((playlist) => (
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
                            By Spotify
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      ) : (
        /* Browse All Category Tiles */
        <section className="flex flex-col gap-5">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Browse all</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {GENRE_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedGenre(cat.name)}
                className={`relative aspect-[1.3] rounded-lg p-4 overflow-hidden cursor-pointer bg-gradient-to-br ${cat.color} hover:brightness-110 transition-all duration-200 shadow-md group`}
              >
                <span className="text-xl font-extrabold text-white tracking-tight line-clamp-2">
                  {cat.name}
                </span>

                {/* Tilted corner album artwork like Spotify */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute -bottom-2 -right-3 w-20 h-20 sm:w-24 sm:h-24 rounded shadow-2xl transform rotate-[25deg] group-hover:rotate-[28deg] group-hover:scale-105 transition-transform duration-300 object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
