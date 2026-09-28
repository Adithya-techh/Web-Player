// Spotify PKCE OAuth Authentication Service

const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-library-read',
  'user-library-modify',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-top-read',
  'user-read-recently-played',
  'streaming'
].join(' ');

export function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = window.crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

export async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Normalizes redirect URI to remove any file suffixes (e.g. Web Player.html)
 * and ensure an exact match with the Spotify Developer Dashboard.
 */
export function getCleanRedirectUri() {
  try {
    const url = new URL(window.location.href);
    let pathname = url.pathname;
    if (pathname.includes('.html')) {
      pathname = pathname.substring(0, pathname.lastIndexOf('/') + 1);
    }
    if (!pathname.endsWith('/')) {
      pathname += '/';
    }
    return url.origin + pathname;
  } catch (e) {
    return window.location.origin + '/';
  }
}

/**
 * Initiates the PKCE redirect to official Spotify login page
 */
export async function redirectToSpotifyAuthorize(clientId) {
  const verifier = generateRandomString(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem('spotify_client_id', clientId);
  localStorage.setItem('spotify_code_verifier', verifier);

  const redirectUri = getCleanRedirectUri();

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    show_dialog: 'true'
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * Exchanges authorization code for access & refresh tokens
 */
export async function exchangeCodeForToken(clientId, code) {
  const verifier = localStorage.getItem('spotify_code_verifier');
  const redirectUri = getCleanRedirectUri();

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirectUri);
  params.append('code_verifier', verifier);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error_description || 'Failed to exchange authorization code for Spotify token');
  }

  const data = await response.json();
  const expiresAt = Date.now() + (data.expires_in * 1000);

  localStorage.setItem('spotify_access_token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
  }
  localStorage.setItem('spotify_token_expires_at', expiresAt.toString());

  return data;
}

/**
 * Refreshes an expired access token
 */
export async function refreshAccessToken() {
  const clientId = localStorage.getItem('spotify_client_id');
  const refreshToken = localStorage.getItem('spotify_refresh_token');

  if (!clientId || !refreshToken) {
    return null;
  }

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!response.ok) {
    clearSpotifyAuth();
    return null;
  }

  const data = await response.json();
  const expiresAt = Date.now() + (data.expires_in * 1000);

  localStorage.setItem('spotify_access_token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
  }
  localStorage.setItem('spotify_token_expires_at', expiresAt.toString());

  return data.access_token;
}

/**
 * Gets valid access token, auto-refreshing if expired
 */
export async function getValidAccessToken() {
  const token = localStorage.getItem('spotify_access_token');
  const expiresAt = parseInt(localStorage.getItem('spotify_token_expires_at') || '0', 10);

  if (!token) return null;

  // If token expires in less than 60 seconds, refresh it
  if (Date.now() > expiresAt - 60000) {
    return await refreshAccessToken();
  }

  return token;
}

export function clearSpotifyAuth() {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expires_at');
  localStorage.removeItem('spotify_code_verifier');
  localStorage.removeItem('spotify_user_profile');
}
