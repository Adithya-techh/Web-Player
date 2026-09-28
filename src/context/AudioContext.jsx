import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS } from '../data/musicData';
import { 
  getValidAccessToken, 
  exchangeCodeForToken, 
  clearSpotifyAuth 
} from '../services/spotifyAuth';
import { 
  fetchUserProfile, 
  fetchUserPlaylists, 
  fetchUserLikedTracks, 
  fetchUserTopTracks, 
  fetchPlaylistTracks,
  searchSpotify,
  triggerSpotifyPlayback
} from '../services/spotifyApi';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  // Catalog with automatic migration of stale audio URLs
  const [tracks, setTracks] = useState(() => {
    try {
      const saved = localStorage.getItem('spotify_custom_tracks');
      if (saved) {
        const parsed = JSON.parse(saved);
        const sanitized = parsed.map(t => {
          if (!t.audioUrl || t.audioUrl.includes('soundhelix.com')) {
            return { ...t, audioUrl: './audio/synthwave.wav' };
          }
          return t;
        });
        return [...INITIAL_TRACKS, ...sanitized];
      }
    } catch (e) {
      console.warn("Failed to parse custom tracks", e);
    }
    return INITIAL_TRACKS;
  });

  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('spotify_playlists');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse playlists", e);
    }
    return INITIAL_PLAYLISTS;
  });

  const [likedSongIds, setLikedSongIds] = useState(() => {
    const saved = localStorage.getItem('spotify_liked_tracks');
    return saved ? JSON.parse(saved) : ["track-1", "track-4", "track-5"];
  });

  // Spotify Authentication & Live Sync State
  const [spotifyUser, setSpotifyUser] = useState(() => {
    const saved = localStorage.getItem('spotify_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSpotifyAuth, setIsSpotifyAuth] = useState(Boolean(localStorage.getItem('spotify_access_token')));
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [isSyncingSpotify, setIsSyncingSpotify] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  // Playback state
  const [currentTrack, setCurrentTrack] = useState(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(INITIAL_TRACKS[0].duration);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState(INITIAL_TRACKS.slice(1));
  const [history, setHistory] = useState([]);
  const [activeContext, setActiveContext] = useState(null);

  // UI overlays & views
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'search' | 'library' | 'playlist' | 'liked'
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [spotifySearchResults, setSpotifySearchResults] = useState(null);

  // Native Audio element reference
  const audioRef = useRef(null);

  // Live Sync Spotify Data: Playlists, Liked Songs, Profile
  const syncSpotifyData = useCallback(async (token, isSilent = false) => {
    if (!token) return;
    if (!isSilent) setIsSyncingSpotify(true);

    try {
      // 1. User Profile
      const profile = await fetchUserProfile(token);
      setSpotifyUser(profile);
      localStorage.setItem('spotify_user_profile', JSON.stringify(profile));
      setIsSpotifyAuth(true);

      // 2. Playlists (Keep up to date with any newly created or updated playlists)
      const userPlaylists = await fetchUserPlaylists(token);
      if (userPlaylists && userPlaylists.length > 0) {
        setPlaylists(prev => {
          const nonSpotify = prev.filter(p => !p.isSpotify);
          const existingSpotifyMap = new Map(
            prev.filter(p => p.isSpotify).map(p => [p.id, p])
          );

          // Merge to preserve already-loaded track IDs
          const updatedSpotifyPlaylists = userPlaylists.map(newP => {
            const existing = existingSpotifyMap.get(newP.id);
            if (existing) {
              return {
                ...newP,
                trackIds: existing.trackIds && existing.trackIds.length > 0 ? existing.trackIds : newP.trackIds
              };
            }
            return newP;
          });

          return [...updatedSpotifyPlaylists, ...nonSpotify];
        });
      }

      // 3. Liked Songs (Sync latest saved tracks from Spotify)
      const likedTracks = await fetchUserLikedTracks(token);
      if (likedTracks && likedTracks.length > 0) {
        setTracks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const newOnes = likedTracks.filter(t => !existingIds.has(t.id));
          return [...newOnes, ...prev];
        });
        setLikedSongIds(prev => Array.from(new Set([...prev, ...likedTracks.map(t => t.id)])));
      }

      // 4. Top Tracks
      const topTracks = await fetchUserTopTracks(token);
      if (topTracks && topTracks.length > 0) {
        setTracks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const newOnes = topTracks.filter(t => !existingIds.has(t.id));
          return [...newOnes, ...prev];
        });
      }

      setLastSyncedAt(Date.now());
    } catch (err) {
      console.warn("Background sync error with Spotify API:", err);
    } finally {
      if (!isSilent) setIsSyncingSpotify(false);
    }
  }, []);

  // Manual Trigger for Full Spotify Refresh
  const refreshSpotifyLibrary = async () => {
    setIsSyncingSpotify(true);
    const token = await getValidAccessToken();
    if (token) {
      await syncSpotifyData(token, false);
    }
    setTimeout(() => setIsSyncingSpotify(false), 600);
  };

  // Re-fetch tracks for a specific Spotify playlist (in case user added tracks in Spotify app)
  const refreshPlaylistTracks = async (playlistId) => {
    const token = await getValidAccessToken();
    if (!token) return [];

    try {
      setIsSyncingSpotify(true);
      const spotifyTracks = await fetchPlaylistTracks(token, playlistId);
      if (spotifyTracks.length > 0) {
        setTracks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const newOnes = spotifyTracks.filter(t => !existingIds.has(t.id));
          return [...newOnes, ...prev];
        });
        setPlaylists(prev => prev.map(p => {
          if (p.id === playlistId) {
            return { ...p, trackIds: spotifyTracks.map(t => t.id), trackCount: spotifyTracks.length };
          }
          return p;
        }));
      }
      return spotifyTracks;
    } catch (err) {
      console.warn("Could not refresh playlist tracks:", err);
      return [];
    } finally {
      setIsSyncingSpotify(false);
    }
  };

  // Continuous Serverless Auto-Sync:
  // 1. Polling interval every 30 seconds
  // 2. Tab focus & visibility change: whenever user switches back from Spotify mobile/desktop app
  useEffect(() => {
    if (!isSpotifyAuth) return;

    // Background interval: poll every 30 seconds
    const interval = setInterval(async () => {
      const token = await getValidAccessToken();
      if (token) {
        syncSpotifyData(token, true); // silent background update
      }
    }, 30000);

    // Window focus / Visibility change listener (instant sync when returning to tab)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const token = await getValidAccessToken();
        if (token) {
          syncSpotifyData(token, true);
        }
      }
    };

    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSpotifyAuth, syncSpotifyData]);

  // Check for Spotify OAuth Callback (?code=...) on page load
  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const clientId = localStorage.getItem('spotify_client_id');

      // Check hash fragment in case implicit grant token returned
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const hashToken = hashParams.get('access_token');
      if (hashToken) {
        window.history.replaceState({}, document.title, window.location.pathname);
        loginWithToken(hashToken);
        return;
      }

      if (error) {
        window.history.replaceState({}, document.title, window.location.pathname);
        console.error("Spotify Auth Callback error:", error);
        alert(`Spotify Login Error: ${error}\nTip: Ensure your Spotify account is added to "User Management" in your Spotify Developer App dashboard.`);
        return;
      }

      if (code) {
        const activeClientId = clientId || prompt("Please enter your Spotify Client ID to complete authentication:");
        if (!activeClientId) {
          return;
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        try {
          setIsSyncingSpotify(true);
          const tokenData = await exchangeCodeForToken(activeClientId, code);
          await syncSpotifyData(tokenData.access_token, false);
        } catch (err) {
          console.error("Spotify Auth Callback failed:", err);
          alert(`Spotify login error: ${err.message}`);
        } finally {
          setIsSyncingSpotify(false);
        }
        return;
      }

      const token = await getValidAccessToken();
      if (token) {
        syncSpotifyData(token, true);
      }
    };

    handleAuthCallback();
  }, [syncSpotifyData]);

  // Direct Token Login
  const loginWithToken = async (manualToken) => {
    try {
      localStorage.setItem('spotify_access_token', manualToken);
      localStorage.setItem('spotify_token_expires_at', (Date.now() + 3600000).toString());
      await syncSpotifyData(manualToken, false);
      return true;
    } catch (err) {
      console.error("Token login failed:", err);
      return false;
    }
  };

  // Logout from Spotify
  const logoutSpotify = () => {
    clearSpotifyAuth();
    setSpotifyUser(null);
    setIsSpotifyAuth(false);
    setPlaylists(INITIAL_PLAYLISTS);
    setTracks(INITIAL_TRACKS);
  };

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('spotify_liked_tracks', JSON.stringify(likedSongIds));
  }, [likedSongIds]);

  useEffect(() => {
    const customOnly = playlists.filter(p => !p.isSpotify);
    localStorage.setItem('spotify_playlists', JSON.stringify(customOnly));
  }, [playlists]);

  // Native Audio setup on mount
  const nextTrackRef = useRef(null);

  useEffect(() => {
    const audio = new Audio();
    // Do NOT set crossOrigin so browser plays all audio streams natively without CORS blockage
    audio.preload = "auto";
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (nextTrackRef.current) nextTrackRef.current();
    };
    const handleError = () => {
      console.warn("Audio element error state:", audio.error);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    if (INITIAL_TRACKS[0]?.audioUrl) {
      audio.src = INITIAL_TRACKS[0].audioUrl;
      audio.load();
    }

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Sync volume & mute to native audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Track playback history
  useEffect(() => {
    if (!currentTrack) return;
    setHistory(prev => {
      if (prev.length === 0 || prev[prev.length - 1].id !== currentTrack.id) {
        return [...prev, currentTrack].slice(-50);
      }
      return prev;
    });
  }, [currentTrack]);

  // Live Spotify Catalog Search when authenticated
  useEffect(() => {
    const handleSearch = async () => {
      if (!isSpotifyAuth || !searchQuery.trim()) {
        setSpotifySearchResults(null);
        return;
      }
      const token = await getValidAccessToken();
      if (token) {
        try {
          const results = await searchSpotify(token, searchQuery);
          setSpotifySearchResults(results);
          if (results.tracks.length > 0) {
            setTracks(prev => {
              const existingIds = new Set(prev.map(t => t.id));
              const newOnes = results.tracks.filter(t => !existingIds.has(t.id));
              return [...newOnes, ...prev];
            });
          }
        } catch (e) {
          console.warn("Spotify search failed:", e);
        }
      }
    };

    const timer = setTimeout(handleSearch, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, isSpotifyAuth]);

  // Helper to safely resolve playable audio URL
  const resolveAudioUrl = (track) => {
    if (!track) return './audio/synthwave.wav';
    if (!track.audioUrl || track.audioUrl.includes('soundhelix.com')) {
      return './audio/synthwave.wav';
    }
    return track.audioUrl;
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;

    if (audio.paused) {
      const targetSrc = resolveAudioUrl(currentTrack);
      if (!audio.src || (!audio.src.endsWith(targetSrc) && audio.src !== targetSrc)) {
        audio.src = targetSrc;
      }
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => setIsPlaying(true)).catch(err => {
          console.warn("Playback prevented:", err);
        });
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const playTrack = (track, newQueue = null, context = null) => {
    if (!track) return;
    if (context) setActiveContext(context);
    
    if (track.isSpotify && track.uri && isSpotifyAuth) {
      getValidAccessToken().then(token => {
        if (token) triggerSpotifyPlayback(token, track.uri);
      });
    }

    if (newQueue) {
      const trackIndex = newQueue.findIndex(t => t.id === track.id);
      if (trackIndex !== -1) {
        setQueue(newQueue.slice(trackIndex + 1));
      } else {
        setQueue(newQueue.filter(t => t.id !== track.id));
      }
    }

    setCurrentTrack(track);

    if (audioRef.current) {
      const audio = audioRef.current;
      const targetSrc = resolveAudioUrl(track);

      if (!audio.src.endsWith(targetSrc) && audio.src !== targetSrc) {
        audio.src = targetSrc;
        audio.currentTime = 0;
        setCurrentTime(0);
      }

      setDuration(track.duration || 180);

      const p = audio.play();
      if (p !== undefined) {
        p.then(() => setIsPlaying(true)).catch(err => {
          console.warn("Direct play error:", err);
        });
      }
    }
  };

  const seekTo = (seconds) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(seconds, duration));
    audioRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const setVolume = (val) => {
    const clamped = Math.max(0, Math.min(val, 1));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const nextMuted = !prev;
      if (audioRef.current) {
        audioRef.current.volume = nextMuted ? 0 : volume;
      }
      return nextMuted;
    });
  };

  const nextTrack = () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.warn(e));
      return;
    }

    if (queue.length > 0) {
      let nextSongIndex = 0;
      if (isShuffle) {
        nextSongIndex = Math.floor(Math.random() * queue.length);
      }
      const nextSong = queue[nextSongIndex];
      const remainingQueue = queue.filter((_, idx) => idx !== nextSongIndex);
      setQueue(remainingQueue);
      playTrack(nextSong);
    } else if (repeatMode === 'all') {
      if (tracks.length > 0) {
        setQueue(tracks.slice(1));
        playTrack(tracks[0]);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const prevTrack = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (history.length > 1) {
      const prevSong = history[history.length - 2];
      setHistory(prev => prev.slice(0, -1));
      if (currentTrack) {
        setQueue(prev => [currentTrack, ...prev]);
      }
      playTrack(prevSong);
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  // Keep nextTrackRef fresh for audio onended event
  useEffect(() => {
    nextTrackRef.current = nextTrack;
  });

  const toggleShuffle = () => setIsShuffle(prev => !prev);

  const cycleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const toggleLike = (trackId) => {
    setLikedSongIds(prev => {
      if (prev.includes(trackId)) {
        return prev.filter(id => id !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
  };

  const isLiked = (trackId) => likedSongIds.includes(trackId);

  const createPlaylist = (name, description = "A fresh mix curated by you") => {
    const newPlaylist = {
      id: `playlist-custom-${Date.now()}`,
      title: name || `My Playlist #${playlists.length + 1}`,
      description: description,
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
      color: "#a855f7",
      followers: "1",
      trackIds: []
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
    setSelectedPlaylistId(newPlaylist.id);
    setCurrentView('playlist');
    return newPlaylist;
  };

  const addTrackToPlaylist = (playlistId, trackId) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId && !p.trackIds.includes(trackId)) {
        return { ...p, trackIds: [...p.trackIds, trackId] };
      }
      return p;
    }));
  };

  const removeTrackFromPlaylist = (playlistId, trackId) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, trackIds: p.trackIds.filter(id => id !== trackId) };
      }
      return p;
    }));
  };

  const deletePlaylist = (playlistId) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    if (selectedPlaylistId === playlistId) {
      setCurrentView('home');
      setSelectedPlaylistId(null);
    }
  };

  const addToQueue = (track) => setQueue(prev => [...prev, track]);
  const removeFromQueue = (index) => setQueue(prev => prev.filter((_, idx) => idx !== index));
  const clearQueue = () => setQueue([]);

  // Fetch playlist tracks from Spotify API if not yet loaded
  const loadSpotifyPlaylistTracks = async (playlistId) => {
    const token = await getValidAccessToken();
    if (!token) return [];

    try {
      const spotifyTracks = await fetchPlaylistTracks(token, playlistId);
      if (spotifyTracks.length > 0) {
        setTracks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const newOnes = spotifyTracks.filter(t => !existingIds.has(t.id));
          return [...newOnes, ...prev];
        });
        setPlaylists(prev => prev.map(p => {
          if (p.id === playlistId) {
            return { ...p, trackIds: spotifyTracks.map(t => t.id), trackCount: spotifyTracks.length };
          }
          return p;
        }));
      }
      return spotifyTracks;
    } catch (err) {
      console.warn("Could not fetch playlist tracks:", err);
      return [];
    }
  };

  const importLocalFiles = (files) => {
    const newTracks = Array.from(files).map((file, index) => {
      const objectUrl = URL.createObjectURL(file);
      const nameParts = file.name.replace(/\.[^/.]+$/, "").split(" - ");
      const artist = nameParts.length > 1 ? nameParts[0].trim() : "Local Artist";
      const title = nameParts.length > 1 ? nameParts[1].trim() : nameParts[0].trim();

      return {
        id: `local-track-${Date.now()}-${index}`,
        title: title,
        artist: artist,
        album: "Local Files",
        duration: 210,
        coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
        audioUrl: objectUrl,
        genre: "Local",
        color: "#9333ea",
        releaseDate: "2024",
        plays: "Local File",
        isLocal: true,
        lyrics: [
          { time: 0, text: "♪ Playing local audio file ♪" },
          { time: 10, text: title },
          { time: 20, text: `by ${artist}` }
        ]
      };
    });

    setTracks(prev => [...prev, ...newTracks]);
    if (newTracks.length > 0) {
      playTrack(newTracks[0], newTracks);
    }
  };

  const getFrequencyData = () => {
    if (!isPlaying) return null;
    const bufferLength = 64;
    const dataArray = new Uint8Array(bufferLength);
    const audio = audioRef.current;
    const t = (audio ? audio.currentTime : Date.now() * 0.001) * 4.5;
    const vol = isMuted ? 0 : volume;

    for (let i = 0; i < bufferLength; i++) {
      // Dynamic frequency spectrum: bass pulse (0-15), mids (16-39), treble (40-63)
      const bass = (Math.sin(t * 2) * 0.5 + 0.5) * 190 + 50;
      const mid = (Math.sin(t * 3.6 + i * 0.16) * 0.5 + 0.5) * 170 + 40;
      const treble = (Math.cos(t * 5.1 + i * 0.32) * 0.5 + 0.5) * 150 + 30;

      let val = 0;
      if (i < 16) {
        val = bass * (1 - i / 16) + mid * (i / 16);
      } else if (i < 40) {
        val = mid;
      } else {
        val = treble * ((64 - i) / 24);
      }

      const pulse = Math.sin(t * 7.5 + i * 0.4) * 20;
      dataArray[i] = Math.max(0, Math.min(255, Math.floor((val + pulse) * vol)));
    }
    return dataArray;
  };

  return (
    <AudioContext.Provider
      value={{
        // Spotify Account & Auto-Sync
        spotifyUser,
        isSpotifyAuth,
        isSpotifyModalOpen,
        setIsSpotifyModalOpen,
        isSyncingSpotify,
        lastSyncedAt,
        refreshSpotifyLibrary,
        refreshPlaylistTracks,
        logoutSpotify,
        loginWithToken,
        loadSpotifyPlaylistTracks,
        spotifySearchResults,

        // Music Catalog
        tracks,
        playlists,
        likedSongIds,

        // Player state
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        history,
        activeContext,

        // Navigation
        currentView,
        setCurrentView,
        selectedPlaylistId,
        setSelectedPlaylistId,
        searchQuery,
        setSearchQuery,
        selectedGenre,
        setSelectedGenre,

        // Overlays
        isLyricsOpen,
        setIsLyricsOpen,
        isVisualizerOpen,
        setIsVisualizerOpen,
        isQueueOpen,
        setIsQueueOpen,
        isCreatePlaylistOpen,
        setIsCreatePlaylistOpen,
        isUploadOpen,
        setIsUploadOpen,

        // Player methods
        playTrack,
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
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        deletePlaylist,
        addToQueue,
        removeFromQueue,
        clearQueue,
        importLocalFiles,
        getFrequencyData,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
