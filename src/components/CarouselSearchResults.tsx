"use client";

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Keyboard, Mousewheel } from 'swiper/modules';
import { Play } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

interface Track {
  id: string;
  title: string;
  artist: string;
  art: string;
}

interface CarouselSearchResultsProps {
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
}

export default function CarouselSearchResults({ tracks, onPlayTrack }: CarouselSearchResultsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!tracks || tracks.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
        <p className="text-xl">No results found.</p>
      </div>
    );
  }

  const activeTrack = tracks[activeIndex];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pt-24 pb-10 z-20 overflow-hidden bg-black/80 backdrop-blur-xl transition-all duration-500">
      
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col items-center justify-center">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          keyboard={{ enabled: true }}
          mousewheel={{ thresholdDelta: 50 }}
          coverflowEffect={{
            rotate: 25,
            stretch: 0,
            depth: 250,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination, Keyboard, Mousewheel]}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="w-full !pb-16"
        >
          {tracks.map((track, index) => (
            <SwiperSlide key={`${track.id}-${index}`} className="!w-[160px] sm:!w-[220px] md:!w-[280px]">
              {({ isActive }) => (
                <div 
                  className={`relative aspect-square w-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 group ${
                    isActive ? 'scale-100 shadow-[0_0_50px_rgba(255,0,0,0.3)] border border-red-500/50' : 'scale-90 opacity-50 grayscale-[50%]'
                  }`}
                  onClick={() => {
                    if (isActive) onPlayTrack(track);
                  }}
                >
                  <img 
                    src={track.art} 
                    alt={track.title} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Play Button Overlay (only on active slide) */}
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isActive ? 'opacity-0 group-hover:opacity-100 cursor-pointer' : 'opacity-0'}`}>
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.8)] hover:scale-110 transition-transform">
                      <Play size={32} className="text-white ml-1" />
                    </div>
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Dynamic Typography below the carousel */}
        <div className="mt-6 text-center animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-2xl px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg tracking-tight mb-1 truncate">
            {activeTrack?.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 drop-shadow-md font-medium truncate">
            {activeTrack?.artist}
          </p>
        </div>
      </div>
    </div>
  );
}
