"use client";

import { useEffect, useState, FormEvent } from 'react';
import AudioPlayer from '@/components/AudioPlayer';
import ExploreSidebar from '@/components/ExploreSidebar';
import VibesModal from '@/components/VibesModal';
import CarouselSearchResults from '@/components/CarouselSearchResults';
import { Play, Search, TrendingUp, X, Sparkles } from 'lucide-react';

export default function Home() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const [numColumns, setNumColumns] = useState(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVibesOpen, setIsVibesOpen] = useState(false);

  useEffect(() => {
    // Handle resizing columns based on screen width
    const handleResize = () => {
      setNumColumns(Math.max(4, Math.floor(window.innerWidth / 180)));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchMusic = async (query: string = '') => {
    setLoading(true);
    setError('');
    try {
      const url = query ? `/api/charts?q=${encodeURIComponent(query)}` : '/api/charts';
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        if (query) setTracks([]); // Clear previous tracks if search fails
      } else if (data.tracks) {
        setTracks(data.tracks);
      }
    } catch (err) {
      setError('Failed to fetch music data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMusic();
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSearchTerm(searchQuery);
      fetchMusic(searchQuery);
    }
  };

  const handlePlayTrack = (track: any) => {
    setCurrentTrack(track);
    setIsPlayerMinimized(false);
  };

  const handleNextTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < tracks.length - 1) {
      handlePlayTrack(tracks[currentIndex + 1]);
    } else if (currentIndex === tracks.length - 1 || currentIndex === -1) {
      handlePlayTrack(tracks[0]);
    }
  };

  const handlePrevTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      handlePlayTrack(tracks[currentIndex - 1]);
    } else if (currentIndex === 0 || currentIndex === -1) {
      handlePlayTrack(tracks[tracks.length - 1]);
    }
  };

  // Utility to shuffle arrays for randomized columns
  const shuffle = (array: any[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  if (loading && tracks.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-white bg-black">
        <div className="animate-pulse text-2xl font-bold tracking-widest text-red-600">LOADING YT MUSIC...</div>
      </div>
    );
  }

  if (error && tracks.length === 0) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center text-white bg-black p-8 text-center">
        <div className="text-red-500 font-bold text-3xl mb-4">API Error</div>
        <div className="text-gray-300 text-lg">{error}</div>
        <div className="mt-8 text-sm text-gray-500 max-w-lg">
          Please open <code>e:\Afosity Music\.env.local</code> and set your <code>YOUTUBE_API_KEY</code>.
        </div>
      </div>
    );
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden text-white">
      {/* Background with Ambient Pulse */}
      <div className="app-bg absolute inset-0 -z-10" />

      {/* Main Content Area (Full screen now) */}
      <div className="absolute inset-0 flex flex-col">

      {/* Top Search Bar */}
      <div className="absolute top-0 left-0 w-full z-40 p-6 flex justify-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <form 
          onSubmit={handleSearch} 
          className="relative w-full max-w-xl pointer-events-auto"
        >
          <div className="relative flex items-center bg-black/60 backdrop-blur-md border border-white/10 rounded-full overflow-hidden shadow-2xl transition-all focus-within:border-red-500/50 focus-within:bg-black/80 focus-within:shadow-[0_0_20px_rgba(255,0,0,0.2)]">
            <Search className="absolute left-4 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for any song or artist..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-white placeholder-gray-400 py-3 pl-12 pr-12 outline-none"
            />
            {activeSearchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveSearchTerm('');
                  fetchMusic('');
                }}
                className="absolute right-24 text-gray-400 hover:text-white transition-colors"
                title="Clear Search"
              >
                <X size={20} />
              </button>
            )}
            <button 
              type="submit" 
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 font-semibold transition-colors z-10"
            >
              Search
            </button>
          </div>
          
          {/* Vibes Pill Button */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setIsVibesOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold rounded-full shadow-[0_0_15px_rgba(192,38,211,0.5)] hover:shadow-[0_0_25px_rgba(192,38,211,0.8)] transition-all hover:scale-105 pointer-events-auto"
            >
              <Sparkles size={18} />
              Explore Vibes
            </button>
          </div>
        </form>
      </div>

      {/* Loading overlay for subsequent searches */}
      {loading && tracks.length > 0 && (
        <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="animate-pulse text-xl font-bold tracking-widest text-white">SEARCHING...</div>
        </div>
      )}

      {/* The Grid Wall or Carousel */}
      {activeSearchTerm ? (
        <CarouselSearchResults 
          tracks={tracks} 
          onPlayTrack={handlePlayTrack} 
        />
      ) : (
      <div 
        className="flex gap-4 h-screen p-4 pt-24 overflow-hidden" 
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
      >
        {Array.from({ length: numColumns }).map((_, colIndex) => {
          // Generate a seamless looping array for each column
          const isDown = colIndex % 2 === 0;
          // Double the duration again to make the movement speed another 50% slower
          const randomDuration = 160 + Math.random() * 80;
          const randomDelay = Math.random() * -120;
          
          // Partition the tracks so each column gets a completely unique set of songs
          const tracksPerColumn = Math.max(1, Math.floor(tracks.length / numColumns));
          const startIndex = colIndex * tracksPerColumn;
          const endIndex = colIndex === numColumns - 1 ? tracks.length : startIndex + tracksPerColumn;
          const columnTracks = tracks.slice(startIndex, endIndex);

          // We need to ensure the column is tall enough to loop seamlessly (taller than screen)
          // We'll build a 'block' of at least 20-30 tracks by repeating this column's unique tracks
          let block: any[] = [];
          if (columnTracks.length > 0) {
            while (block.length < 25) {
              block = [...block, ...shuffle(columnTracks)];
            }
          }
          
          // Duplicate the block perfectly so that `translateY(-50%)` loops seamlessly
          const duplicatedSet = [...block, ...block];

          return (
            <div key={colIndex} className="flex-1 flex flex-col min-w-[150px] relative overflow-visible group/col">
              <div 
                className={`flex flex-col gap-4 w-full will-change-transform ${isDown ? 'scroll-down' : 'scroll-up'} group-hover/col:[animation-play-state:paused]`}
                style={{ 
                  animationDuration: `${randomDuration}s`, 
                  animationDelay: `${randomDelay}s` 
                }}
              >
                {duplicatedSet.map((track, i) => (
                  <div 
                    key={`${track.id}-${i}`} 
                    className="track-card relative w-full aspect-square bg-black/40 rounded-2xl overflow-hidden cursor-pointer group shadow-lg transition-transform hover:scale-105 hover:z-20 hover:shadow-red-500/20 border border-transparent hover:border-red-500/50"
                    onClick={() => handlePlayTrack(track)}
                  >
                    <img 
                      src={track.art} 
                      alt={track.title} 
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                      loading="lazy"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 translate-y-4 group-hover:translate-y-0">
                      <div className="flex justify-between items-end">
                        <div className="flex-1 overflow-hidden pr-2">
                          <div className="text-white font-bold text-sm truncate drop-shadow-md">{track.title}</div>
                          <div className="text-gray-300 text-xs truncate drop-shadow-md">{track.artist}</div>
                        </div>
                        
                        <button 
                          className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0 hover:bg-red-500 shadow-[0_4px_12px_rgba(255,0,0,0.5)] hover:scale-110 transition-transform"
                        >
                          <Play size={18} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      )}

      </div>

      {/* Trending Toggle Button (Top Left) */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 transition-all shadow-lg"
          title="Trending & Playlists"
        >
          {isSidebarOpen ? <X size={24} /> : <TrendingUp size={24} className="text-red-500" />}
        </button>
      </div>

      {/* Explore Sidebar Overlay (Left) */}
      <div 
        className={`absolute top-0 left-0 h-full z-40 transition-transform duration-500 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <ExploreSidebar onPlayTrack={handlePlayTrack} />
      </div>

      {/* Vibes Modal Overlay */}
      <VibesModal 
        isOpen={isVibesOpen} 
        onClose={() => setIsVibesOpen(false)} 
        onSelectVibe={(vibe) => {
          setSearchQuery(vibe);
          setActiveSearchTerm(vibe);
          fetchMusic(vibe);
        }} 
      />

      {/* Audio Player */}
      <AudioPlayer 
        currentTrack={currentTrack} 
        onClose={() => setCurrentTrack(null)} 
        isMinimized={isPlayerMinimized}
        onMinimize={() => setIsPlayerMinimized(true)}
        onMaximize={() => setIsPlayerMinimized(false)}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
      />
    </main>
  );
}
