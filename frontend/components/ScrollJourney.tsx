'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

export default function ScrollJourney() {
  const [pageHeight, setPageHeight] = useState(0);
  
  useEffect(() => {
    // Update height on mount and resize
    const updateHeight = () => {
      setPageHeight(document.body.scrollHeight);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    // Also observe DOM mutations to recalculate height if content loads
    const observer = new MutationObserver(updateHeight);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      observer.disconnect();
    };
  }, []);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    return smoothProgress.onChange((v) => {
      if (pathRef.current && dotRef.current) {
        const totalLength = pathRef.current.getTotalLength();
        if (totalLength) {
          const pt = pathRef.current.getPointAtLength(v * totalLength);
          dotRef.current.setAttribute('cx', pt.x.toString());
          dotRef.current.setAttribute('cy', pt.y.toString());
        }
      }
    });
  }, [smoothProgress]);

  if (pageHeight === 0) return null;

  // We construct a dynamic SVG path that travels down the page
  const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const centerX = w / 2;
  const h = pageHeight;
  
  // A subtle, elegant organic curve that snakes down the page
  const d = `
    M ${centerX} 0 
    C ${centerX + 150} ${h * 0.15}, ${centerX - 200} ${h * 0.25}, ${centerX} ${h * 0.35}
    C ${centerX + 200} ${h * 0.45}, ${centerX - 150} ${h * 0.55}, ${centerX} ${h * 0.65}
    C ${centerX + 150} ${h * 0.75}, ${centerX - 100} ${h * 0.85}, ${centerX} ${h}
  `;

  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0, // Behind content but in front of very back backgrounds
        opacity: 0.5 // Subtle
      }}
    >
      <svg 
        width="100%" 
        height="100%" 
        preserveAspectRatio="none" 
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <motion.path
          ref={pathRef}
          d={d}
          fill="none"
          stroke="var(--color-primary-green)"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          strokeLinecap="round"
          style={{ pathLength: smoothProgress, opacity: 0.4 }}
        />
        {/* Continuous drawn line */}
        <motion.path
          d={d}
          fill="none"
          stroke="var(--color-primary-green)"
          strokeWidth="2"
          style={{ pathLength: smoothProgress }}
        />
        {/* Glow effect on the active path */}
        <motion.path
          d={d}
          fill="none"
          stroke="var(--color-emerald)"
          strokeWidth="2"
          style={{ pathLength: smoothProgress, filter: 'blur(4px)' }}
        />
        
        {/* The traveling progress marker */}
        <circle 
          ref={dotRef}
          cx="-100" 
          cy="-100" 
          r="6" 
          fill="var(--color-white)" 
          stroke="var(--color-emerald)" 
          strokeWidth="2"
          style={{ filter: 'drop-shadow(0 0 8px var(--color-emerald))' }}
        />
      </svg>
    </div>
  );
}
