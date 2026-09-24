"use client";

import React, { useEffect, useRef } from "react";

export default function HeroHologramGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Generate 3D sphere points
    const points: { x: number; y: number; z: number; origX: number; origY: number; origZ: number; size: number }[] = [];
    const numPoints = 140;
    const radius = Math.min(width, height) * 0.38;

    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      points.push({ x, y, z, origX: x, origY: y, origZ: z, size: Math.random() * 2 + 1.2 });
    }

    let angleY = 0;
    let angleX = 0.2;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0.003;
    let targetRotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseX = (e.clientX - cx) / (rect.width / 2);
      mouseY = (e.clientY - cy) / (rect.height / 2);
      targetRotY = mouseX * 0.006 + 0.003;
      targetRotX = mouseY * 0.004;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      angleY += targetRotY;
      angleX += (targetRotX - angleX) * 0.05;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Draw Atmospheric Glow behind globe
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.3);
      glowGrad.addColorStop(0, "rgba(16, 185, 129, 0.18)");
      glowGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.08)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Draw Orbiting Rings
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.35);

      // Outer ring
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.35, radius * 0.45, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(52, 211, 153, 0.22)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);
      ctx.stroke();

      // Middle ring
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.15, radius * 0.38, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.restore();

      // Project and draw 3D Points
      const projected = points.map((p) => {
        // Y-axis rotation
        let x1 = p.origX * cosY - p.origZ * sinY;
        let z1 = p.origZ * cosY + p.origX * sinY;
        // X-axis rotation
        let y1 = p.origY * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.origY * sinX;

        const fov = 400;
        const scale = fov / (fov + z2);
        return {
          px: cx + x1 * scale,
          py: cy + y1 * scale,
          scale,
          z: z2,
          size: p.size * scale,
        };
      });

      // Sort by depth
      projected.sort((a, b) => a.z - b.z);

      // Draw Connections between close nodes
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 55 && p1.z > -100 && p2.z > -100) {
            const alpha = (1 - dist / 55) * 0.25 * ((p1.scale + p2.scale) / 2);
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw Nodes
      projected.forEach((p) => {
        const alpha = Math.max(0.15, Math.min(0.9, (p.z + radius) / (radius * 2)));
        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(0.5, p.size), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(110, 231, 183, ${alpha})`;
        ctx.shadowColor = "#10B981";
        ctx.shadowBlur = p.z > 0 ? 8 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="hero-hologram-globe-container" aria-hidden="true">
      <canvas ref={canvasRef} className="hero-hologram-canvas" />
    </div>
  );
}
