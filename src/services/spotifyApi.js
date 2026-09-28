// Spotify Web API calls and data transformers

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

async function spotifyFetch(endpoint, token, options = {}) {
  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error?.message || `Spotify API error (${response.status})`);
  }

  return await response.json();
}

/**
 * Maps Spotify API Track object to our internal Track format
 */
export function mapSpotifyTrack(t) {
  if (!t) return null;
  const track = t.track ? t.track : t;
  if (!track || !track.id) return null;

  const coverUrl = track.album?.images?.[0]?.url || 
                   track.album?.images?.[1]?.url || 
                   "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80";

  return {
    id: `spotify-${track.id}`,
    spotifyId: track.id,
    uri: track.uri,
    title: track.name,
    artist: track.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
    album: track.album?.name || 'Single',
    duration: Math.round((track.duration_ms || 0) / 1000),
    coverUrl: coverUrl,
    // Preview URL from Spotify if available; fallback to high-fidelity local audio assets
    audioUrl: track.preview_url || [
      './audio/synthwave.wav',
      './audio/lofi-study.mp3',
      './audio/edm-pulse.wav',
      './audio/lofi-beats.wav',
      './audio/pop-voyage.wav',
      './audio/acoustic-sunset.wav',
      './audio/electronic.mp3',
      './audio/chill-ambient.wav'
    ][(track.id || "").charCodeAt(0) % 8 || 0],
    hasPreview: Boolean(track.preview_url),
    genre: "Spotify",
    color: "#a855f7",
    releaseDate: track.album?.release_date?.substring(0, 4) || '2024',
    plays: `${(track.popularity || 75) * 125000}`,
    isSpotify: true,
    lyrics: [
      { time: 0, text: `♪ ${track.name} ♪` },
      { time: 5, text: `by ${track.artists?.map(a => a.name).join(', ')}` },
      { time: 10, text: `Album: ${track.album?.name}` },
      { time: 20, text: "♪ Streaming from Spotify ♪" }
    ]
  };
}

/**
 * Maps Spotify Playlist to internal format
 */
export function mapSpotifyPlaylist(p) {
  if (!p) return null;
  const coverUrl = p.images?.[0]?.url || 
                   "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80";

  return {
    id: `spotify-playlist-${p.id}`,
    spotifyId: p.id,
    uri: p.uri,
    title: p.name,
    description: p.description || `Created by ${p.owner?.display_name || 'Spotify'}`,
    coverUrl: coverUrl,
    color: "#a855f7",
    followers: p.followers?.total?.toLocaleString() || "10,000+",
    trackCount: p.tracks?.total || 0,
    trackIds: [],
    isSpotify: true
  };
}

export async function fetchUserProfile(token) {
  return await spotifyFetch('/me', token);
}

export async function fetchUserPlaylists(token, limit = 50) {
  const data = await spotifyFetch(`/me/playlists?limit=${limit}`, token);
  return (data.items || []).map(mapSpotifyPlaylist).filter(Boolean);
}

export async function fetchUserLikedTracks(token, limit = 50) {
  const data = await spotifyFetch(`/me/tracks?limit=${limit}`, token);
  return (data.items || []).map(item => mapSpotifyTrack(item.track)).filter(Boolean);
}

export async function fetchUserTopTracks(token, limit = 20) {
  const data = await spotifyFetch(`/me/top/tracks?limit=${limit}&time_range=short_term`, token);
  return (data.items || []).map(mapSpotifyTrack).filter(Boolean);
}

export async function fetchPlaylistTracks(token, playlistId) {
  const realId = playlistId.replace('spotify-playlist-', '');
  const data = await spotifyFetch(`/playlists/${realId}/tracks?limit=50`, token);
  return (data.items || []).map(item => mapSpotifyTrack(item.track)).filter(Boolean);
}

export async function searchSpotify(token, query) {
  if (!query || !query.trim()) return { tracks: [], playlists: [] };
  const encoded = encodeURIComponent(query.trim());
  const data = await spotifyFetch(`/search?q=${encoded}&type=track,playlist&limit=10`, token);
  
  const tracks = (data.tracks?.items || []).map(mapSpotifyTrack).filter(Boolean);
  const playlists = (data.playlists?.items || []).map(mapSpotifyPlaylist).filter(Boolean);
  return { tracks, playlists };
}

export async function getActivePlaybackDevice(token) {
  try {
    return await spotifyFetch('/me/player/devices', token);
  } catch (e) {
    return null;
  }
}

export async function triggerSpotifyPlayback(token, uri) {
  try {
    await spotifyFetch('/me/player/play', token, {
      method: 'PUT',
      body: JSON.stringify({ uris: [uri] })
    });
    return true;
  } catch (e) {
    console.warn("Could not trigger remote Spotify connect playback (requires active Spotify device/premium):", e);
    return false;
  }
}
