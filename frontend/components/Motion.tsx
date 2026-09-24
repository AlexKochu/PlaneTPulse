'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useInView, Variants, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

// --- Shared Tokens ---
export const transitionBase = { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const };
export const transitionSpring = { type: 'spring' as const, stiffness: 300, damping: 20 };
export const transitionSlow = { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const };

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

// --- Reveal ---
export const Reveal = ({ children, delay = 0, className = '', direction = 'up' }: { children: React.ReactNode, delay?: number, className?: string, direction?: 'up' | 'down' | 'left' | 'right' | 'none' }) => {
  const reducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  
  let y = 0;
  let x = 0;
  if (direction === 'up') y = 24;
  if (direction === 'down') y = -24;
  if (direction === 'left') x = 24;
  if (direction === 'right') x = -24;

  const variants: Variants = {
    hidden: { opacity: 0, y, x },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0, 
      transition: { ...transitionBase, delay, duration: 0.6 } 
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial={reducedMotion ? "visible" : "hidden"}
      animate={reducedMotion ? "visible" : (isInView ? "visible" : "hidden")}
    >
      {children}
    </motion.div>
  );
};

// --- Stagger Container ---
export const StaggerContainer = ({ children, delay = 0, staggerChildren = 0.08, className = '' }: { children: React.ReactNode, delay?: number, staggerChildren?: number, className?: string }) => {
  const reducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  
  const variants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerChildren
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial={reducedMotion ? "visible" : "hidden"}
      animate={reducedMotion ? "visible" : (isInView ? "visible" : "hidden")}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  const variants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: transitionBase }
  };
  return <motion.div variants={variants} className={className}>{children}</motion.div>;
};

// --- Hover Lift ---
export const HoverLift = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      whileHover={reducedMotion ? {} : { y: -4, transition: transitionSpring }}
    >
      {children}
    </motion.div>
  );
};

// --- Tilt Card ---
export const TiltCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reducedMotion || !ref.current || window.innerWidth < 768) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    setRotateX(yPct * -10); // max 10 deg tilt
    setRotateY(xPct * 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
};

// --- Count Up ---
export const CountUp = ({ to, duration = 1.5, decimals = 0, className = '' }: { to: number, duration?: number, decimals?: number, className?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setCount(to);
      return;
    }
    if (isInView) {
      let startTime: number;
      let animationFrame: number;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        setCount(ease * to);
        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
        } else {
          setCount(to);
        }
      };
      animationFrame = requestAnimationFrame(step);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, to, duration, reducedMotion]);

  return <span ref={ref} className={className}>{count.toFixed(decimals)}</span>;
};

// --- Magnetic Button ---
export const MagneticButton = ({ children, className = '', ...props }: any) => {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (reducedMotion || !ref.current || window.innerWidth < 768) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.2;
    const y = (clientY - (top + height / 2)) * 0.2;
    setPosition({ x, y });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={position}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

/**
 * JourneySection — For the continuous scroll journey experience.
 * Fades and slightly scales content as it enters/leaves the viewport,
 * making the active section feel like the current "destination".
 */
export function JourneySection({ 
  children, 
  className = "", 
  id = "" 
}: { 
  children: React.ReactNode; 
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 25%"]
  });
  
  // Transform scroll progress into opacity and scale
  // When scroll is between 0.1 and 0.9, it's fully opaque
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.15, 1, 1, 0.15]);
  const scale = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.97, 1, 1, 0.97]);
  const y = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [30, 0, 0, -30]);

  if (prefersReducedMotion) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      ref={ref}
      className={className}
      style={{ opacity, scale, y, transformOrigin: 'center center' }}
    >
      {children}
    </motion.section>
  );
}
