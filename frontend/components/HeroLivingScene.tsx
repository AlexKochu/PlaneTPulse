'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  return reduced;
};

export default function HeroLivingScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Draw particles
  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number, y: number, radius: number, speedY: number, speedX: number, alpha: number }[] = [];
    const numParticles = window.innerWidth > 768 ? 30 : 10;
    
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          speedY: Math.random() * -0.5 - 0.1,
          speedX: Math.random() * 0.4 - 0.2,
          alpha: Math.random() * 0.5 + 0.1
        });
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };
    
    window.addEventListener('resize', resize);
    resize();

    let animationFrame: number;
    let isActive = true;

    // Intersection observer to pause off screen
    const observer = new IntersectionObserver(([entry]) => {
      isActive = entry.isIntersecting;
    });
    if (containerRef.current) observer.observe(containerRef.current);

    const animate = () => {
      if (!isActive) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [reducedMotion]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    if (reducedMotion || window.innerWidth < 768) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 12; // max 12px
    const y = (e.clientY / innerHeight - 0.5) * 12;
    setMousePos({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      className="hero-living-scene" 
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: 'var(--color-bg)' }}
      onMouseMove={handleMouseMove}
      aria-hidden="true"
    >
      <div 
        className="hero-base-layer" 
        style={{
          position: 'absolute', inset: -20, 
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <Image 
          src="/images/hero-forest.jpg"
          alt=""
          fill
          priority
          style={{ objectFit: 'cover', ...(!reducedMotion && { animation: 'kenBurns 30s infinite alternate ease-in-out' }) }}
        />
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes kenBurns {
            0% { transform: scale(1) translate(0, 0); }
            100% { transform: scale(1.06) translate(-1%, -1%); }
          }
        `}} />
      </div>

      {/* Atmosphere particles */}
      <canvas 
        ref={canvasRef} 
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} 
      />
      
      {/* Overlay gradient to ensure text readability (WCAG AA) */}
      <div 
        style={{
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(180deg, rgba(246, 250, 247, 0.4) 0%, rgba(246, 250, 247, 0.95) 100%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
