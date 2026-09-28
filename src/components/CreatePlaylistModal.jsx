import React, { useState } from 'react';
import { X, Music } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function CreatePlaylistModal() {
  const { isCreatePlaylistOpen, setIsCreatePlaylistOpen, createPlaylist } = useAudio();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isCreatePlaylistOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createPlaylist(name.trim(), description.trim());
    setName('');
    setDescription('');
    setIsCreatePlaylistOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#282828] w-full max-w-md rounded-xl p-6 shadow-2xl border border-white/10 flex flex-col gap-6 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create New Playlist</h2>
          <button
            onClick={() => setIsCreatePlaylistOpen(false)}
            className="p-1 rounded-full text-[#a7a7a7] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            {/* Visual Icon */}
            <div className="w-28 h-28 rounded-lg bg-[#3e3e3e] flex items-center justify-center shrink-0 shadow-inner">
              <Music className="w-12 h-12 text-[#a7a7a7]" />
            </div>

            <div className="flex flex-col gap-3 flex-1">
              <div>
                <label className="text-xs font-semibold text-[#b3b3b3] block mb-1">Name</label>
                <input
                  type="text"
                  placeholder="My Playlist #1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 bg-[#3e3e3e] text-white text-sm rounded border border-transparent focus:border-white/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#b3b3b3] block mb-1">Description (optional)</label>
                <textarea
                  placeholder="Give your playlist a catchy description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 bg-[#3e3e3e] text-white text-xs rounded border border-transparent focus:border-white/40 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsCreatePlaylistOpen(false)}
              className="px-4 py-2 text-sm font-bold text-white hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2 bg-[#a855f7] hover:bg-[#9333ea] disabled:opacity-50 text-white text-sm font-bold rounded-full transition-transform active:scale-95 shadow-lg shadow-purple-500/25"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
