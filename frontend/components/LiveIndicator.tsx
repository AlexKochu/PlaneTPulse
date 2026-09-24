import React from "react";

interface LiveIndicatorProps {
  label?: string;
  className?: string;
}

export default function LiveIndicator({
  label = "LIVE PULSE",
  className = "",
}: LiveIndicatorProps) {
  return (
    <div className={`live-indicator-badge ${className}`}>
      <span className="live-indicator-dot-outer">
        <span className="live-indicator-dot-inner" />
        <span className="live-indicator-dot-ping" />
      </span>
      <span className="live-indicator-text">{label}</span>
    </div>
  );
}
