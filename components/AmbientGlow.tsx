"use client";

import React from "react";

export default function AmbientGlow() {
  return (
    <div className="ambient-glow-system" aria-hidden="true">
      {/* Primary Luminous Orbs */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />
      <div className="ambient-orb ambient-orb-4" />

      {/* Floating Glassy Geometric Accents */}
      <div className="ambient-geo-shape geo-shape-1" />
      <div className="ambient-geo-shape geo-shape-2" />
      <div className="ambient-geo-shape geo-shape-3" />

      {/* Climate Mesh Grid Overlay */}
      <div className="ambient-mesh-grid" />
    </div>
  );
}
