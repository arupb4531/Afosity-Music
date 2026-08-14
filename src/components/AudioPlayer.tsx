"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Music, ChevronDown, ChevronUp, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import YouTube from 'react-youtube';
import { FastAverageColor } from 'fast-average-color';
import ProceduralBackground from './ProceduralBackground';

interface LrcLine {
  time: number;
  text: string;
}

export default function AudioPlayer({ 
  currentTrack, 
  onClose,
  isMinimized,
  onMinimize,
  onMaximize,
  onNext,
  onPrev
}: { 
  currentTrack: any, 
  onClose: () => void,
  isMinimized: boolean,
  onMinimize: () => void,
  onMaximize: () => void,
  onNext: () => void,
  onPrev: () => void
}) {
  const [lrcLines, setLrcLines] = useState<LrcLine[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string>('');
  const [loadingLyrics, setLoadingLyrics] = useState<boolean>(true);
  
  const [player, setPlayer] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeLineIdx, setActiveLineIdx] = useState<number>(-1);
  const [bgColor, setBgColor] = useState<string>('rgba(150, 0, 0, 0.3)');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
        setIsPlaying(false);
      } else {
        player.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Extract Dominant Color from Album Art
  useEffect(() => {
    if (!currentTrack?.art) return;
    
    const fac = new FastAverageColor();
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = currentTrack.art;
    
    img.onload = () => {
      try {
        const color = fac.getColor(img);
        // Make the color slightly transparent for the glowing effect
        setBgColor(`rgba(${color.value[0]}, ${color.value[1]}, ${color.value[2]}, 0.5)`);
      } catch (e) {
        console.warn('Could not extract color from image', e);
      }
    };
  }, [currentTrack]);

  const fetchYouTubeCaptions = async (lang?: string) => {
    try {
      setLoadingLyrics(true);
      const url = lang 
        ? `/api/transcript?videoId=${currentTrack.id}&lang=${lang}`
        : `/api/transcript?videoId=${currentTrack.id}`;
      
      const captionRes = await fetch(url);
      const captionData = await captionRes.json();
      
      if (captionRes.ok && Array.isArray(captionData) && captionData.length > 0) {
        const parsedCaptions = captionData.map((cap: any) => ({
          time: cap.offset / 1000,
          text: cap.text.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
        }));
        setLrcLines(parsedCaptions);
        setLoadingLyrics(false);
        return true;
      }
    } catch (e) {
      console.warn('YouTube Captions fetch failed', e);
    }
    setLoadingLyrics(false);
    return false;
  };

  // Fetch LRC synced lyrics (Initial Load)
  useEffect(() => {
    if (!currentTrack) return;
    
    setLoadingLyrics(true);
    setLrcLines([]);
    setPlainLyrics('');

    const fetchInitialLyrics = async () => {
        const cleanArtist = currentTrack.artist.replace(/ - Topic/g, '').split(',')[0].trim();
        const cleanTitle = currentTrack.title.replace(/\(Official.*\)|\(Music Video\)|\(Lyric.*\)|\[.*\]/gi, '').trim();

        // 1. Try fetching from LRCLIB for synced lyrics
        let lrcLibSynced = false;
        try {
          const res = await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`);
          const data = await res.json();
          
          if (data && data.length > 0 && data[0].syncedLyrics) {
            const lrcString = data[0].syncedLyrics;
            const lines = lrcString.split('\n');
            const parsedLines: LrcLine[] = [];
            
            lines.forEach((line: string) => {
              const match = line.match(/\[(\d{2}):(\d{2}\.\d{2,3})\](.*)/);
              if (match) {
                const min = parseInt(match[1]);
                const sec = parseFloat(match[2]);
                const text = match[3].trim();
                if (text) { // ignore blank lines
                  parsedLines.push({ time: min * 60 + sec, text });
                }
              }
            });
            
            setLrcLines(parsedLines);
            lrcLibSynced = true;
          } else if (data && data.length > 0 && data[0].plainLyrics) {
            // Keep plain lyrics as a secondary fallback
            setPlainLyrics(data[0].plainLyrics);
          }
        } catch (e) {
          console.warn('LRCLIB fetch failed', e);
        }

        if (lrcLibSynced) {
          setLoadingLyrics(false);
          return;
        }

        // 2. Fallback to YouTube Captions (default language)
        const hasCaptions = await fetchYouTubeCaptions();
        if (hasCaptions) return;

        // 3. Fallback to Lyrics.ovh or the Plain Lyrics we saved earlier
        if (!plainLyrics) {
          try {
            const fallbackRes = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`);
            const fallbackData = await fallbackRes.json();
            if (fallbackData.lyrics) {
              setPlainLyrics(fallbackData.lyrics);
            } else {
              setPlainLyrics("🎵 Lyrics and Captions not available for this track yet. Enjoy the music! 🎵");
            }
          } catch(e) {
            setPlainLyrics("🎵 Lyrics and Captions not available for this track yet. Enjoy the music! 🎵");
          }
        }
        setLoadingLyrics(false);
    };

    fetchInitialLyrics();
  }, [currentTrack]);

  // Sync loop to grab current time from YouTube player
  useEffect(() => {
    let interval: any;
    if (player && lrcLines.length > 0) {
      interval = setInterval(async () => {
        try {
          const time = await player.getCurrentTime();
          if (time !== undefined) {
            setCurrentTime(time);
          }
        } catch (e) {
          // Ignore polling errors
        }
      }, 200); // 5 times a second
    }
    return () => clearInterval(interval);
  }, [player, lrcLines]);

  // Find the active LRC line based on current time
  useEffect(() => {
    if (lrcLines.length === 0) return;
    
    let currentIdx = -1;
    for (let i = 0; i < lrcLines.length; i++) {
      if (currentTime >= lrcLines[i].time) {
        currentIdx = i;
      } else {
        break; // Stop loop once we find a line in the future
      }
    }
    
    if (currentIdx !== activeLineIdx && currentIdx !== -1) {
      // Removing setState from inside this effect can be tricky due to dependencies,
      // but wrapping it to only happen when currentIdx is valid and changed
      setActiveLineIdx(currentIdx);
      
      // Auto-scroll logic
      if (activeLineRef.current && lyricsContainerRef.current) {
        lyricsContainerRef.current.scrollTo({
          top: activeLineRef.current.offsetTop - (lyricsContainerRef.current.clientHeight / 2) + 20,
          behavior: 'smooth'
        });
      }
    }
  }, [currentTime, lrcLines, activeLineIdx]);

  if (!currentTrack) return null;

  return (
    <div className={`fixed z-50 transition-all duration-500 overflow-hidden ${
      isMinimized 
        ? 'bottom-0 left-0 right-0 h-20 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between px-4 sm:px-6' 
        : 'inset-0 bg-[#0a0a0a] backdrop-blur-md'
    }`}>
      
      {/* ------------- FULL SCREEN ELEMENTS ------------- */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Procedural Canvas Background */}
        <ProceduralBackground trackId={currentTrack.id} color={bgColor} />

        {/* Top Actions */}
        <button onClick={onMinimize} className="absolute top-6 left-6 text-white/50 hover:text-white p-3 bg-black/20 hover:bg-black/40 rounded-full transition-all z-50 shadow-lg backdrop-blur-md" title="Minimize">
          <ChevronDown size={28} />
        </button>
        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-red-400 p-3 bg-black/20 hover:bg-black/40 rounded-full transition-all z-50 shadow-lg backdrop-blur-md" title="Close">
          <X size={28} />
        </button>

        {/* TOP RIGHT: Lyrics Box */}
        <div className="absolute top-8 right-8 w-[280px] md:w-[320px] lg:w-[380px] h-[300px] md:h-[350px] bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col transform rotate-1 z-40">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 text-center drop-shadow-md">Lyrics</h2>
          
          <div 
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto pr-4 custom-scrollbar text-center relative"
          >
            {loadingLyrics ? (
              <div className="flex items-center justify-center h-full text-white/50 animate-pulse text-sm tracking-widest">
                SEARCHING LYRICS...
              </div>
            ) : lrcLines.length > 0 ? (
              // SYNCED LYRICS RENDER
              <div className="py-[150px] flex flex-col gap-6">
                {lrcLines.map((line, i) => {
                  const isActive = i === activeLineIdx;
                  const isPassed = i < activeLineIdx;
                  
                  return (
                    <div 
                      key={i}
                      ref={isActive ? activeLineRef : null}
                      className={`transition-all duration-500 font-medium ${
                        isActive 
                          ? 'text-white text-lg md:text-xl scale-105 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' 
                          : isPassed
                            ? 'text-white/40 text-sm md:text-base scale-95 blur-[0.5px]'
                            : 'text-white/30 text-sm md:text-base scale-95 blur-[0.5px]'
                      }`}
                    >
                      {line.text}
                    </div>
                  );
                })}
              </div>
            ) : (
              // PLAIN LYRICS FALLBACK
              <div className="text-white/80 text-base leading-relaxed font-medium whitespace-pre-line">
                {plainLyrics}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM LEFT: Cover Art & Track Info Box */}
        <div className="absolute bottom-8 left-8 w-[320px] bg-gradient-to-br from-[#2a080d] to-[#150204] p-5 rounded-3xl border border-red-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -rotate-2 hover:rotate-0 transition-transform duration-500 z-40">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-6 shadow-2xl border border-white/10 group">
            <img 
              src={currentTrack.art} 
              alt={currentTrack.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>
          
          <div className="px-2">
            <h3 className="text-white font-bold text-2xl truncate mb-1 drop-shadow-md" title={currentTrack.title}>
              {currentTrack.title}
            </h3>
            <p className="text-red-300/80 text-base truncate font-medium tracking-wide drop-shadow-sm" title={currentTrack.artist}>
              {currentTrack.artist}
            </p>
          </div>
        </div>
      </div>

      {/* ------------- YOUTUBE PLAYER (ALWAYS MOUNTED) ------------- */}
      {/* When minimized, we move it off-screen so it doesn't block clicks but keeps playing */}
      <div className={`absolute pointer-events-none z-30 transition-all duration-500 ${
        isMinimized ? 'opacity-0 -top-[1000px]' : 'inset-0 flex items-center justify-center opacity-100'
      }`}>
        <div className="pointer-events-auto w-[90%] max-w-xl lg:max-w-2xl bg-[#1a0508] p-3 md:p-4 rounded-2xl border border-red-900/30 shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500">
          <div className="flex items-center gap-2 mb-3 text-red-200/70 font-semibold text-sm uppercase tracking-widest">
            <Music size={16} /> Official Video
          </div>
          <div className="w-full rounded-xl overflow-hidden shadow-[0_0_30px_rgba(255,0,0,0.1)] bg-black aspect-video relative">
            <YouTube 
              videoId={currentTrack.id} 
              opts={{
                height: '100%',
                width: '100%',
                playerVars: { autoplay: 1, controls: 1, modestbranding: 1, rel: 0, cc_load_policy: 1 },
                host: 'https://www.youtube-nocookie.com'
              }}
              onReady={(e) => {
                setPlayer(e.target);
                e.target.addEventListener('onApiChange', (apiEvent: any) => {
                  if (apiEvent.target && typeof apiEvent.target.getOption === 'function') {
                    const track = apiEvent.target.getOption('captions', 'track');
                    if (track && track.languageCode) {
                      fetchYouTubeCaptions(track.languageCode);
                    }
                  }
                });
              }}
              onStateChange={(e) => {
                if (e.data === 1) setIsPlaying(true);
                else if (e.data === 2) setIsPlaying(false);
              }}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* ------------- MINIMIZED BAR ELEMENTS ------------- */}
      <div className={`w-full flex items-center justify-between transition-opacity duration-500 ${
        isMinimized ? 'opacity-100 pointer-events-auto delay-200' : 'opacity-0 pointer-events-none hidden'
      }`}>
        {/* Left: Art & Info */}
        <div className="flex items-center gap-4 cursor-pointer group" onClick={onMaximize}>
          <div className="w-14 h-14 rounded-lg overflow-hidden relative border border-white/10 group-hover:border-white/30 transition-colors">
            <img src={currentTrack.art} alt={currentTrack.title} className="w-full h-full object-cover" />
          </div>
          <div className="max-w-[150px] sm:max-w-xs md:max-w-md flex flex-col">
            <h4 className="text-white font-semibold text-sm sm:text-base truncate group-hover:text-red-400 transition-colors">{currentTrack.title}</h4>
            <p className="text-white/60 text-xs sm:text-sm truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Center/Right: Controls */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button onClick={onPrev} className="text-white/70 hover:text-white transition-colors p-2" title="Previous Track">
            <SkipBack size={20} />
          </button>
          <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg" title={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause size={24} className="fill-black" /> : <Play size={24} className="fill-black ml-1" />}
          </button>
          <button onClick={onNext} className="text-white/70 hover:text-white transition-colors p-2" title="Next Track">
            <SkipForward size={20} />
          </button>
          <div className="w-px h-8 bg-white/20 mx-1 sm:mx-2 hidden sm:block"></div>
          <button onClick={onMaximize} className="text-white/50 hover:text-white transition-colors hidden sm:block p-2" title="Expand Player">
            <ChevronUp size={24} />
          </button>
          <button onClick={onClose} className="text-white/50 hover:text-red-400 transition-colors p-2" title="Close Player">
            <X size={24} />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
      `}} />
    </div>
  );
}
