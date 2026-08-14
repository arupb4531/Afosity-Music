"use client";

import React, { useEffect, useRef, useState } from 'react';

const SYMBOLS = ['🎵', '🎶', '✨', '✦', '🎼', '🎧'];
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

class Particle {
  x: number;
  y: number;
  symbol: string;
  color: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  scale: number;
  rotation: number;
  rotationSpeed: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    // Random direction outwards
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = (Math.random() - 0.5) * 3 - 0.5; // Slight upward bias
    this.maxLife = 30 + Math.random() * 30; // frames
    this.life = this.maxLife;
    this.scale = 0.5 + Math.random() * 0.8;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05; // slight gravity
    this.rotation += this.rotationSpeed;
    this.life--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.scale(this.scale * alpha, this.scale * alpha); // shrink as they die
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, 0, 0);
    ctx.restore();
  }
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const isMoving = useRef(false);
  const isPointerFine = useRef(true); // Default to true, update on mount

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    isPointerFine.current = window.matchMedia('(pointer: fine)').matches;
  }, []);

  useEffect(() => {
    if (!mounted || !isPointerFine.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Set canvas size to window
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let animationFrameId: number;
    let lastSpawnTime = 0;

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lerp for buttery smooth cursor movement
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.4;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.4;

      // Update cursor position using GPU-accelerated translate3d
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`;
      }

      // Add particles if moving, throttle spawn rate
      if (isMoving.current && time - lastSpawnTime > 30) {
        // Spawn 1-2 particles per frame when moving
        const spawnCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < spawnCount; i++) {
          particles.current.push(new Particle(mousePos.current.x, mousePos.current.y));
        }
        lastSpawnTime = time;
      }

      // Update & Draw particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) {
          particles.current.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      isMoving.current = true;
      
      // Reset isMoving after a tiny delay to stop spawning when stationary
      clearTimeout((window as any).isMovingTimeout);
      (window as any).isMovingTimeout = setTimeout(() => {
        isMoving.current = false;
      }, 50);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted]);

  // Don't render anything on touch devices
  if (!mounted || !isPointerFine.current) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998]"
      />
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ transform: 'translate(-100px, -100px)', willChange: 'transform' }} // Hide initially
      >
        {/* Centered wrapper to offset the cursor exactly to the center of the disc */}
        <div className="relative -left-3 -top-3">
          {/* Tilted wrapper for the oval 3D look */}
          <div className="scale-y-75">
            {/* Silver Disc */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-100 via-slate-400 to-slate-200 border border-slate-400 flex items-center justify-center animate-[spin_1s_linear_infinite] shadow-xl drop-shadow-[0_4px_8px_rgba(255,255,255,0.5)]">
              {/* Grooves */}
              <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full border border-slate-300 flex items-center justify-center">
                  {/* Center Hole */}
                  <div className="w-1 h-1 rounded-full bg-black/60 shadow-inner"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
