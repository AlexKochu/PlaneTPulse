"use client";

import React, { useEffect, useState } from "react";

export default function InteractiveGlow() {
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [targetPos, setTargetPos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTargetPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      setMousePos((prev) => ({
        x: prev.x + (targetPos.x - prev.x) * 0.08,
        y: prev.y + (targetPos.y - prev.y) * 0.08,
      }));
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetPos]);

  return (
    <div className="interactive-glow-container" aria-hidden="true">
      <div
        className="cursor-ambient-glow"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px) translate(-50%, -50%)`,
        }}
      />
    </div>
  );
}
