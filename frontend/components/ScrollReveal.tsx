"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (prefersReducedMotion || isVisible) return "translate(0, 0) scale(1)";
    switch (direction) {
      case "up":
        return "translateY(28px) scale(0.985)";
      case "down":
        return "translateY(-28px) scale(0.985)";
      case "left":
        return "translateX(28px)";
      case "right":
        return "translateX(-28px)";
      case "none":
        return "scale(0.97)";
    }
  };

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isVisible ? "is-revealed" : ""} ${className}`}
      style={{
        opacity: prefersReducedMotion || isVisible ? 1 : 0,
        transform: getTransform(),
        transition: prefersReducedMotion
          ? "none"
          : `opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
