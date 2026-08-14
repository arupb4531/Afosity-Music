"use client";

import React, { useEffect, useRef } from 'react';

interface ProceduralBackgroundProps {
  trackId: string;
  color: string;
}

export default function ProceduralBackground({ trackId, color }: ProceduralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: any[] = [];

    // Resize canvas
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Parse the color (e.g. "rgba(255, 100, 50, 0.5)") to extract RGB
    // If we can't parse, fallback to white
    let r = 255, g = 255, b = 255;
    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbaMatch) {
      r = parseInt(rgbaMatch[1]);
      g = parseInt(rgbaMatch[2]);
      b = parseInt(rgbaMatch[3]);
    }

    // Hash the track ID to create a deterministic seed
    const safeTrackId = trackId || 'fallback-seed';
    const hash = safeTrackId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    const seed = Math.abs(hash);

    // Procedural Parameters based on the seed
    const numParticles = 40 + (seed % 60); // 40 to 100 particles
    const shapeType = seed % 4; // 0=circle, 1=square, 2=triangle, 3=line
    const speedMult = 0.5 + ((seed % 15) / 10); // 0.5 to 1.9
    const movementType = seed % 3; // 0=float, 1=wave, 2=chaotic
    const sizeMult = 0.5 + ((seed % 5) * 0.5); // 0.5 to 2.5

    // Initialize particles
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: (Math.random() * 20 + 5) * sizeMult,
        speedX: (Math.random() * 2 - 1) * speedMult,
        speedY: (Math.random() * 2 - 1) * speedMult,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() * 0.05 - 0.025) * speedMult,
        offset: Math.random() * 100 // For wave movement
      });
    }

    let time = 0;

    const render = () => {
      time += 0.01;
      
      // Clear canvas with a very faint trail effect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        // Movement Logic
        if (movementType === 0) {
          // Float
          p.x += p.speedX;
          p.y += p.speedY;
        } else if (movementType === 1) {
          // Wave
          p.x += p.speedX;
          p.y += Math.sin(time * 2 + p.offset) * 2 * speedMult;
        } else {
          // Chaotic
          p.x += p.speedX + Math.sin(time * 5 + p.offset);
          p.y += p.speedY + Math.cos(time * 5 + i);
        }
        
        p.angle += p.spin;

        // Screen Wrap
        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;
        if (p.y < -50) p.y = canvas.height + 50;
        if (p.y > canvas.height + 50) p.y = -50;

        // Draw Particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        
        // Dynamic opacity based on size and time
        const opacity = Math.abs(Math.sin(time + p.offset)) * 0.5 + 0.15;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 1.5})`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        if (shapeType === 0) {
          // Circle
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (shapeType === 1) {
          // Square
          ctx.rect(-p.size/2, -p.size/2, p.size, p.size);
          ctx.fill();
          ctx.stroke();
        } else if (shapeType === 2) {
          // Triangle
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size, p.size);
          ctx.lineTo(-p.size, p.size);
          ctx.closePath();
          ctx.fill();
        } else if (shapeType === 3) {
          // Line / Cross
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(p.size, 0);
          ctx.moveTo(0, -p.size);
          ctx.lineTo(0, p.size);
          ctx.stroke();
        }
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [trackId, color]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 opacity-80 pointer-events-none transition-opacity duration-1000 mix-blend-screen"
    />
  );
}
