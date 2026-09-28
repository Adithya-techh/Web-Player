import React, { useState, useRef } from 'react';
import { X, Upload, Music, CheckCircle2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function UploadModal() {
  const { isUploadOpen, setIsUploadOpen, importLocalFiles } = useAudio();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const fileInputRef = useRef(null);

  if (!isUploadOpen) return null;

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    importLocalFiles(files);
    setUploadedFilesCount(files.length);
    setTimeout(() => {
      setIsUploadOpen(false);
      setUploadedFilesCount(0);
    }, 1200);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#242424] w-full max-w-lg rounded-xl p-6 shadow-2xl border border-white/10 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#a855f7]" />
            <h2 className="text-xl font-bold text-white">Import Your Music</h2>
          </div>
          <button
            onClick={() => setIsUploadOpen(false)}
            className="p-1 rounded-full text-[#a7a7a7] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag and Drop Zone */}
        {uploadedFilesCount > 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <CheckCircle2 className="w-16 h-16 text-[#a855f7] animate-bounce" />
            <h3 className="text-lg font-bold text-white">Imported {uploadedFilesCount} songs successfully!</h3>
            <p className="text-xs text-[#a7a7a7]">Starting playback now...</p>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#a855f7] bg-[#a855f7]/10 scale-[1.01]'
                : 'border-[#444444] hover:border-white/60 bg-[#181818]/60 hover:bg-[#181818]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              multiple
              accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full bg-[#282828] flex items-center justify-center text-[#a855f7] mb-4 shadow">
              <Music className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Drag & Drop your audio files here
            </h3>
            <p className="text-xs text-[#a7a7a7] mb-4">
              Supports MP3, WAV, FLAC, OGG, M4A, AAC
            </p>
            <button
              type="button"
              className="px-5 py-2 bg-white text-black hover:bg-white/90 text-xs font-bold rounded-full transition-transform active:scale-95 shadow"
            >
              Browse Computer Files
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-[#a7a7a7]">
          <span>Files are played locally directly in your browser.</span>
          <button
            onClick={() => setIsUploadOpen(false)}
            className="hover:text-white hover:underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
