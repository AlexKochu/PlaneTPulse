import React from "react";

interface PlanetPulseLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function PlanetPulseLogo({
  size = "md",
  showText = true,
  className = "",
}: PlanetPulseLogoProps) {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  const currentSize = iconSizes[size] || 32;

  return (
    <div className={`planetpulse-logo-wrapper ${className}`} style={{ display: "inline-flex", alignItems: "center", gap: size === "sm" ? "8px" : "10px" }}>
      <div
        className="planetpulse-logo-mark"
        style={{
          width: currentSize,
          height: currentSize,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {/* Ambient glow behind mark */}
        <div
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0) 70%)",
            filter: "blur(4px)",
            pointerEvents: "none",
          }}
        />

        <svg
          width={currentSize}
          height={currentSize}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="ppPlanetGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="ppRingGrad" x1="2" y1="18" x2="34" y2="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Central Planet Sphere */}
          <circle
            cx="18"
            cy="18"
            r="11"
            fill="url(#ppPlanetGrad)"
            opacity="0.9"
          />

          {/* Planet Atmospheric Shadow / Highlight */}
          <circle
            cx="18"
            cy="18"
            r="11"
            fill="none"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="1.2"
          />

          {/* Angled Orbital Ring */}
          <ellipse
            cx="18"
            cy="18"
            rx="16"
            ry="6"
            fill="none"
            stroke="url(#ppRingGrad)"
            strokeWidth="1.8"
            strokeDasharray="80 15"
            transform="rotate(-25 18 18)"
          />

          {/* The Pulse wave through the center (ECG / Life pulse) */}
          <path
            d="M9 18H14L16 13L18.5 22L21 15L22.5 18H27"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Live indicator dot on orbit */}
          <circle cx="31" cy="12" r="2.2" fill="#34D399" className="pulse-orbit-dot" />
        </svg>
      </div>

      {showText && (
        <span
          className="planetpulse-logo-text"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: size === "sm" ? "1.05rem" : size === "lg" ? "1.45rem" : "1.25rem",
            letterSpacing: "-0.03em",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            color: "var(--color-text)",
            lineHeight: 1,
          }}
        >
          PlanetPulse
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "var(--color-food, #10b981)",
              display: "inline-block",
              boxShadow: "0 0 8px rgba(16, 185, 129, 0.8)",
              animation: "pulse-dot 2s infinite ease-in-out",
            }}
          />
        </span>
      )}
    </div>
  );
}
