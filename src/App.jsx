import React from 'react';
import { AudioProvider, useAudio } from './context/AudioContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import PlayerBar from './components/PlayerBar';
import HomeView from './components/HomeView';
import SearchView from './components/SearchView';
import LibraryView from './components/LibraryView';
import PlaylistView from './components/PlaylistView';
import LikedSongsView from './components/LikedSongsView';
import LyricsView from './components/LyricsView';
import VisualizerOverlay from './components/VisualizerOverlay';
import QueueDrawer from './components/QueueDrawer';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import UploadModal from './components/UploadModal';
import SpotifyLoginModal from './components/SpotifyLoginModal';

function MainLayout() {
  const { currentView } = useAudio();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'search':
        return <SearchView />;
      case 'library':
        return <LibraryView />;
      case 'playlist':
        return <PlaylistView />;
      case 'liked':
        return <LikedSongsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-white">
      {/* Upper Area: Sidebar + Main Content + Queue */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Center Main View Area */}
        <main className="flex-1 flex flex-col bg-[#121212] rounded-lg m-2 ml-0 overflow-hidden relative shadow-2xl">
          <Navbar />
          
          <div className="flex-1 overflow-y-auto relative scroll-smooth">
            {renderCurrentView()}
          </div>

          {/* Interactive Karaoke Lyrics View */}
          <LyricsView />

          {/* Live Web Audio Visualizer */}
          <VisualizerOverlay />
        </main>

        {/* Right Flyout Queue Drawer */}
        <QueueDrawer />
      </div>

      {/* Persistent Bottom Audio Player */}
      <PlayerBar />

      {/* Global Modals */}
      <CreatePlaylistModal />
      <UploadModal />
      <SpotifyLoginModal />
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <MainLayout />
    </AudioProvider>
  );
}
