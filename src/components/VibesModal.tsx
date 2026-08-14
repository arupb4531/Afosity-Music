"use client";

import React, { useEffect } from 'react';
import { X, Sparkles, Headphones, Flame, Coffee, Heart, Zap, Moon, Music, Radio } from 'lucide-react';

interface VibesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVibe: (vibe: string) => void;
}

const VIBES = [
  { name: 'Electronic', query: 'Electronic dance mix', color: 'from-fuchsia-600 via-pink-700 to-purple-900', icon: Zap, span: 'col-span-2 row-span-2' },
  { name: 'Hip-Hop', query: 'Hip Hop hits', color: 'from-emerald-500 to-teal-900', icon: Radio, span: 'col-span-1 row-span-1' },
  { name: 'Pop', query: 'Pop hits', color: 'from-yellow-400 to-orange-600', icon: Sparkles, span: 'col-span-1 row-span-1' },
  { name: 'Chill', query: 'Chill lofi relax', color: 'from-cyan-500 to-blue-800', icon: Coffee, span: 'col-span-1 row-span-1' },
  { name: 'R&B', query: 'R&B soul', color: 'from-indigo-500 to-purple-900', icon: Heart, span: 'col-span-1 row-span-1' },
  { name: 'Party', query: 'Party dance hits', color: 'from-orange-500 to-red-700', icon: Flame, span: 'col-span-1 row-span-1' },
  { name: 'Workout', query: 'Workout gym motivation', color: 'from-green-500 to-emerald-800', icon: Zap, span: 'col-span-2 row-span-1' },
  { name: 'Sleep', query: 'Deep sleep ambient', color: 'from-blue-900 to-slate-900', icon: Moon, span: 'col-span-1 row-span-1' },
  { name: 'Jazz', query: 'Smooth jazz lounge', color: 'from-amber-700 to-orange-900', icon: Music, span: 'col-span-2 row-span-1' },
  { name: 'Rock', query: 'Rock classic hits', color: 'from-red-700 to-rose-900', icon: Headphones, span: 'col-span-2 row-span-1' },
];

export default function VibesModal({ isOpen, onClose, onSelectVibe }: VibesModalProps) {
  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all shadow-xl hover:scale-110 z-50"
      >
        <X size={32} />
      </button>

      <div className="w-full max-w-6xl h-full max-h-[90vh] p-4 md:p-8 overflow-y-auto custom-scrollbar flex flex-col relative">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
          Explore Vibes
        </h2>
        <p className="text-gray-300 text-lg mb-8 font-medium">Choose a mood to instantly transform your music space.</p>
        
        {/* Bento Box Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[220px] gap-4 md:gap-6">
          {VIBES.map((vibe, i) => (
            <div 
              key={i}
              onClick={() => {
                onSelectVibe(vibe.query);
                onClose();
              }}
              className={`relative ${vibe.span} rounded-3xl overflow-hidden cursor-pointer group shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(255,255,255,0.15)]`}
            >
              {/* Vibrant Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${vibe.color} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Decorative Abstract Shapes (Procedural CSS) */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out" />

              {/* Inner Content */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                    {vibe.name}
                  </h3>
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-md shadow-lg group-hover:bg-white/30 transition-colors">
                    <vibe.icon size={24} className="text-white drop-shadow-sm" />
                  </div>
                </div>
                
                {/* Hover Reveal Label */}
                <div className="translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="inline-flex items-center gap-2 text-white/90 font-semibold bg-black/30 backdrop-blur-md px-4 py-2 rounded-full text-sm">
                    <Sparkles size={16} /> Play {vibe.name} Mix
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
