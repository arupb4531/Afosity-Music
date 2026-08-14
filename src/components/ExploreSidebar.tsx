"use client";

import React, { useEffect, useState } from 'react';
import { Play, TrendingUp, ListMusic } from 'lucide-react';

interface ExploreSidebarProps {
  onPlayTrack: (track: any) => void;
}

export default function ExploreSidebar({ onPlayTrack }: ExploreSidebarProps) {
  const [trending, setTrending] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        const headers: HeadersInit = {};
        const localKey = localStorage.getItem('youtube_api_key');
        if (localKey) headers['x-youtube-api-key'] = localKey;

        const res = await fetch('/api/explore', { headers });
        const data = await res.json();
        
        if (data.trending) setTrending(data.trending);
        if (data.playlists) setPlaylists(data.playlists);
      } catch (e) {
        console.error('Failed to fetch explore data', e);
      } finally {
        setLoading(false);
      }
    };

    fetchExploreData();
  }, []);

  if (loading) {
    return (
      <div className="w-80 h-full bg-black/60 border-r border-white/5 backdrop-blur-md p-6 pt-24 flex flex-col gap-6 z-20 animate-pulse shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        <div className="h-6 bg-white/10 rounded w-1/2 mb-4"></div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-white/10 rounded"></div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-3 bg-white/10 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-black/60 border-r border-white/5 backdrop-blur-md p-6 pt-24 overflow-y-auto custom-scrollbar flex flex-col gap-8 z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
      
      {/* Trending Section */}
      <section>
        <div className="flex items-center gap-2 text-white mb-6">
          <TrendingUp className="text-red-500" size={20} />
          <h2 className="text-xl font-bold tracking-wide">Trending Now</h2>
        </div>
        
        <div className="flex flex-col gap-4">
          {trending.map((track, i) => (
            <div 
              key={track.id} 
              className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
              onClick={() => onPlayTrack(track)}
            >
              <div className="text-gray-500 font-bold w-4 text-right group-hover:text-red-500">{i + 1}</div>
              <div className="relative w-12 h-12 rounded bg-black/50 overflow-hidden shrink-0">
                <img src={track.art} alt={track.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={16} className="text-white ml-1" />
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-white text-sm font-semibold truncate">{track.title}</div>
                <div className="text-gray-400 text-xs truncate">{track.artist}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Playlists Section */}
      <section>
        <div className="flex items-center gap-2 text-white mb-6 pt-4 border-t border-white/10">
          <ListMusic className="text-red-500" size={20} />
          <h2 className="text-xl font-bold tracking-wide">Popular Playlists</h2>
        </div>
        
        <div className="flex flex-col gap-4">
          {playlists.map((playlist) => (
            <div 
              key={playlist.id} 
              className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
            >
              <div className="relative w-16 h-16 rounded-md bg-black/50 overflow-hidden shrink-0 shadow-lg">
                <img src={playlist.art} alt={playlist.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-white text-sm font-semibold leading-tight line-clamp-2">{playlist.title}</div>
                <div className="text-gray-400 text-xs truncate mt-1">{playlist.channel}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
