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

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
}

export default function HeroLivingScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Draw particles — firefly-like glowing orbs
  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    const numParticles = window.innerWidth > 768 ? 55 : 20;

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2.5 + 0.8,
          speedY: Math.random() * -0.4 - 0.05,
          speedX: Math.random() * 0.3 - 0.15,
          alpha: Math.random() * 0.6 + 0.2,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.008,
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
        p.pulse += p.pulseSpeed;

        // Wrap around
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        const pulsedAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        const pulsedRadius = p.radius * (0.85 + 0.15 * Math.sin(p.pulse * 1.3));

        // Glowing core
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulsedRadius * 4);
        gradient.addColorStop(0, `rgba(160, 230, 180, ${pulsedAlpha})`);
        gradient.addColorStop(0.4, `rgba(120, 200, 140, ${pulsedAlpha * 0.5})`);
        gradient.addColorStop(1, `rgba(80, 160, 100, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, pulsedRadius * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Bright center dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulsedRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 255, 230, ${Math.min(1, pulsedAlpha * 1.4)})`;
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
    const x = (e.clientX / innerWidth - 0.5) * 18;
    const y = (e.clientY / innerHeight - 0.5) * 18;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className="hero-living-scene"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#0a1f12' }}
      onMouseMove={handleMouseMove}
      aria-hidden="true"
    >
      {/* Forest image layer — full brightness, subtle parallax */}
      <div
        className="hero-base-layer"
        style={{
          position: 'absolute',
          inset: -24,
          transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)`,
          transition: 'transform 0.12s ease-out',
        }}
      >
        <Image
          src="/images/hero-forest.jpg"
          alt=""
          fill
          priority
          style={{
            objectFit: 'cover',
            objectPosition: 'center 25%',
            filter: 'brightness(1.08) contrast(1.06) saturate(1.12)',
            ...(!reducedMotion && { animation: 'kenBurns 28s infinite alternate ease-in-out' }),
          }}
        />
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes kenBurns {
            0%   { transform: scale(1)    translate(0, 0); }
            50%  { transform: scale(1.04) translate(-0.8%, 0.5%); }
            100% { transform: scale(1.08) translate(-1.2%, -0.8%); }
          }
        `}} />
      </div>

      {/* Depth layer — subtle vignette around edges only */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 50% 0%, transparent 60%, rgba(5,15,8,0.45) 100%),
            radial-gradient(ellipse at 0% 50%, rgba(5,15,8,0.3) 0%, transparent 60%),
            radial-gradient(ellipse at 100% 50%, rgba(5,15,8,0.3) 0%, transparent 60%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Mist / atmosphere layer — soft green tint at very bottom only */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 0%, transparent 55%, rgba(12, 30, 18, 0.55) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Light-ray shimmer (top-left to bottom-right diagonal) */}
      {!reducedMotion && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(120,200,130,0.06) 0%, transparent 50%)',
            animation: 'shimmer 8s ease-in-out infinite alternate',
            pointerEvents: 'none',
          }}
        />
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0%   { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}} />

      {/* Firefly / pollen particles */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen' }}
      />

      {/* Minimal bottom fade — only enough for text at very bottom, forest stays vivid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 40%, rgba(246,250,247,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
