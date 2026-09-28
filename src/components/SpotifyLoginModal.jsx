import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Check, 
  Key, 
  ShieldCheck, 
  LogOut, 
  User, 
  Sparkles, 
  Music2,
  Copy,
  Info
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { redirectToSpotifyAuthorize, getCleanRedirectUri } from '../services/spotifyAuth';

export default function SpotifyLoginModal() {
  const { 
    isSpotifyModalOpen, 
    setIsSpotifyModalOpen, 
    spotifyUser, 
    isSpotifyAuth, 
    logoutSpotify, 
    loginWithToken 
  } = useAudio();

  const [clientId, setClientId] = useState(() => localStorage.getItem('spotify_client_id') || '');
  const [tokenInput, setTokenInput] = useState('');
  const [activeTab, setActiveTab] = useState('oauth'); // 'oauth' | 'token'
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedUri, setCopiedUri] = useState(false);

  if (!isSpotifyModalOpen) return null;

  const currentRedirectUri = getCleanRedirectUri();

  const handleCopyUri = () => {
    navigator.clipboard.writeText(currentRedirectUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const handleOAuthLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const trimmedId = clientId.trim();
    if (!trimmedId) {
      setErrorMsg('Please enter your Spotify Client ID');
      return;
    }

    try {
      await redirectToSpotifyAuthorize(trimmedId);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initiate login');
    }
  };

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const trimmedToken = tokenInput.trim();
    if (!trimmedToken) {
      setErrorMsg('Please enter a Spotify access token');
      return;
    }

    const success = await loginWithToken(trimmedToken);
    if (!success) {
      setErrorMsg('Invalid or expired token. Please verify and try again.');
    } else {
      setIsSpotifyModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 flex flex-col gap-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#a855f7] flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Connect Spotify Account</h2>
              <p className="text-xs text-[#a7a7a7]">Log in with your official Spotify credentials</p>
            </div>
          </div>

          <button
            onClick={() => setIsSpotifyModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-[#333333] text-[#a7a7a7] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Already Logged In */}
        {isSpotifyAuth && spotifyUser ? (
          <div className="flex flex-col gap-6 py-2">
            <div className="p-4 bg-[#282828] rounded-xl flex items-center gap-4 border border-[#3e3e3e]">
              {spotifyUser.images?.[0]?.url ? (
                <img
                  src={spotifyUser.images[0].url}
                  alt={spotifyUser.display_name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#a855f7]"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#a855f7] text-white font-extrabold text-2xl flex items-center justify-center">
                  {spotifyUser.display_name?.charAt(0) || 'U'}
                </div>
              )}

              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#a855f7] uppercase tracking-wider">Connected</span>
                  <span className="text-xs text-[#a7a7a7]">• {spotifyUser.product || 'Standard'}</span>
                </div>
                <h3 className="text-lg font-bold text-white truncate">{spotifyUser.display_name}</h3>
                <p className="text-xs text-[#a7a7a7] truncate">{spotifyUser.email}</p>
                <p className="text-xs text-[#a7a7a7] mt-0.5">{spotifyUser.followers?.total || 0} followers • Country: {spotifyUser.country || 'Global'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setIsSpotifyModalOpen(false)}
                className="px-5 py-2.5 bg-[#333333] hover:bg-[#3e3e3e] text-white text-xs font-bold rounded-full transition-colors"
              >
                Close & Enjoy
              </button>

              <button
                onClick={logoutSpotify}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-bold rounded-full border border-red-500/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* Not Logged In - Login Methods */
          <div className="flex flex-col gap-5">
            {/* Tabs */}
            <div className="flex bg-[#282828] p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('oauth')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'oauth' ? 'bg-[#a855f7] text-white shadow-md shadow-purple-500/25' : 'text-[#b3b3b3] hover:text-white'
                }`}
              >
                OAuth Login (Recommended)
              </button>
              <button
                onClick={() => setActiveTab('token')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === 'token' ? 'bg-[#a855f7] text-white shadow-md shadow-purple-500/25' : 'text-[#b3b3b3] hover:text-white'
                }`}
              >
                Direct Token
              </button>
            </div>

            {/* Local File Protocol Alert */}
            {typeof window !== 'undefined' && window.location.protocol === 'file:' && (
              <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex flex-col gap-1.5">
                <span className="font-bold">⚠️ Running Web Player from local disk (file:///)</span>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Spotify OAuth requires an online web address. To use OAuth, open our live link at{' '}
                  <a 
                    href="https://adithya-techh.github.io/Web-Player/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="underline font-bold text-white hover:text-amber-200"
                  >
                    adithya-techh.github.io/Web-Player
                  </a>{' '}
                  or switch to the <button type="button" onClick={() => setActiveTab('token')} className="underline font-bold text-white hover:text-amber-200">Direct Token</button> tab to connect immediately right here offline!
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                {errorMsg}
              </div>
            )}

            {activeTab === 'oauth' ? (
              <form onSubmit={handleOAuthLogin} className="flex flex-col gap-4">
                {/* 3 Step Instruction Box */}
                <div className="p-4 bg-[#262626] rounded-xl text-xs flex flex-col gap-3 border border-white/5">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#a855f7]" />
                    30-Second Setup with Spotify Developer:
                  </span>
                  
                  <div className="flex flex-col gap-2.5 text-[#b3b3b3]">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#333333] text-white flex items-center justify-center shrink-0 font-bold text-[11px]">1</span>
                      <p>
                        Go to{' '}
                        <a 
                          href="https://developer.spotify.com/dashboard" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[#c084fc] hover:underline font-bold inline-flex items-center gap-1"
                        >
                          developer.spotify.com/dashboard <ExternalLink className="w-3 h-3 inline" />
                        </a>{' '}
                        and open your app <strong>Settings</strong>.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#333333] text-white flex items-center justify-center shrink-0 font-bold text-[11px]">2</span>
                      <div className="flex-1">
                        <p className="mb-1">Under <strong>Redirect URIs</strong>, add this exact URI, click <strong>+ Add</strong>, then scroll down and click <strong>Save</strong>:</p>
                        <div className="flex items-center gap-2 bg-[#181818] px-2.5 py-1.5 rounded border border-[#3e3e3e]">
                          <code className="text-white text-[11px] font-mono select-all flex-1 truncate">
                            {currentRedirectUri}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyUri}
                            className="text-[#c084fc] hover:text-white p-1 shrink-0 flex items-center gap-1 text-[11px]"
                            title="Copy URI"
                          >
                            {copiedUri ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedUri ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="mt-1 text-[10px] text-[#a7a7a7]">
                          ⚠️ Must click <strong>+ Add</strong> and scroll to bottom to click the green <strong>Save</strong> button!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#333333] text-white flex items-center justify-center shrink-0 font-bold text-[11px]">3</span>
                      <p>Copy your <strong>Client ID</strong> from Basic Information and paste it below.</p>
                    </div>
                  </div>
                </div>

                {/* Client ID input */}
                <div>
                  <label className="text-xs font-semibold text-[#b3b3b3] block mb-1.5">
                    Your Spotify Client ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5ca07d9907d64d98acfd35a4026ea1e9"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#2a2a2a] text-white text-sm rounded-lg border border-transparent focus:border-[#a855f7] focus:outline-none font-mono"
                  />
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-[#a855f7] hover:bg-[#9333ea] text-white font-extrabold text-sm rounded-full transition-transform active:scale-98 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  <span>Log In With Spotify</span>
                </button>
              </form>
            ) : (
              /* Direct Token Login */
              <form onSubmit={handleTokenSubmit} className="flex flex-col gap-4">
                <div className="p-4 bg-[#262626] rounded-xl text-xs flex flex-col gap-2.5 border border-white/5 text-[#b3b3b3]">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#a855f7]" />
                    Instant 15-Second Connect (No Redirect URI Setup):
                  </span>
                  <p>
                    1. Open the{' '}
                    <a
                      href="https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#c084fc] hover:underline font-bold inline-flex items-center gap-1"
                    >
                      Spotify Web API Console <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </p>
                  <p>2. Click <strong>"Try It"</strong> on the right side and log in.</p>
                  <p>3. Copy the token generated in the box and paste it below.</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#b3b3b3] block mb-1.5">
                    Bearer Access Token
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Paste Spotify Bearer token here (e.g. BQB...)"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#2a2a2a] text-white text-xs rounded-lg border border-transparent focus:border-[#a855f7] focus:outline-none font-mono resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#a855f7] hover:bg-[#9333ea] text-white font-extrabold text-sm rounded-full transition-transform active:scale-98 shadow-lg shadow-purple-500/30"
                >
                  Connect with Token
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
