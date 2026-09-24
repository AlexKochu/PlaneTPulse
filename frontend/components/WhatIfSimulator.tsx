"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, AlertTriangle, Activity, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ACTIVITY_TYPES, ACTIVITY_CONFIGS, calculateCO2 } from "@/lib/calculations";
import { runSimulation } from "@/lib/simulator";
import { validateActivityInput } from "@/lib/validation";
import { getAllActivities } from "@/lib/storage";
import type { ActivityType, ActivityRecord } from "@/lib/types";

export default function WhatIfSimulator() {
  const [currentActivity, setCurrentActivity] = useState<ActivityType | "">("");
  const [quantity, setQuantity] = useState<string>("");
  const [alternativeActivity, setAlternativeActivity] = useState<ActivityType | "">("");
  
  const [confirmedUnusual, setConfirmedUnusual] = useState(false);
  const [recentActivities, setRecentActivities] = useState<ActivityRecord[]>([]);

  useEffect(() => {
    try {
      setRecentActivities(getAllActivities().slice(0, 5));
    } catch (err) {
      console.error("Failed to load recent activities for simulator:", err);
    }
  }, []);

  // When current activity changes, reset alternative if units don't match, or keep it.
  // We'll filter alternatives to match the unit of currentActivity.
  useEffect(() => {
    if (currentActivity && alternativeActivity) {
      if (ACTIVITY_CONFIGS[currentActivity].unit !== ACTIVITY_CONFIGS[alternativeActivity].unit) {
        setAlternativeActivity("");
      }
    }
    setConfirmedUnusual(false);
  }, [currentActivity, alternativeActivity]);

  useEffect(() => {
    setConfirmedUnusual(false);
  }, [quantity]);

  const handleQuickScenario = (curr: ActivityType, alt: ActivityType, qty: string) => {
    setCurrentActivity(curr);
    setAlternativeActivity(alt);
    setQuantity(qty);
    setConfirmedUnusual(false);
  };

  const handleLoadRecent = (activity: ActivityRecord) => {
    setCurrentActivity(activity.activityType);
    setQuantity(String(activity.quantity));
    setAlternativeActivity("");
    setConfirmedUnusual(false);
  };

  let error = "";
  let warning = "";
  let currentCO2 = 0;
  let alternativeCO2 = 0;
  let diff = 0;
  let canCalculate = false;

  const simResult = runSimulation(currentActivity, alternativeActivity, quantity, confirmedUnusual);

  if (!simResult.success) {
    if (simResult.warning) {
      warning = simResult.warning;
    } else {
      error = simResult.error || "Unable to calculate.";
    }
  } else {
    currentCO2 = simResult.currentCO2!;
    alternativeCO2 = simResult.alternativeCO2!;
    diff = simResult.diff!;
    canCalculate = true;
  }

  const currentUnit = currentActivity ? ACTIVITY_CONFIGS[currentActivity].unit : "";
  const availableAlternatives = currentActivity
    ? ACTIVITY_TYPES.filter((type) => ACTIVITY_CONFIGS[type].unit === currentUnit && type !== currentActivity)
    : ACTIVITY_TYPES;

  return (
    <div className="card dashboard-card-full-height what-if-simulator" data-testid="what-if-simulator">
      <div className="card-header" style={{ marginBottom: "0.5rem" }}>
        <span className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Activity size={20} className="text-green-500" /> WHAT IF?
        </span>
        <span className="card-badge card-badge-green">Simulator</span>
      </div>
      <p className="section-subtitle" style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Simulate a different routine and see how it could change your footprint.
      </p>

      <div className="simulator-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "2rem" }}>
        {/* Left Side: Inputs */}
        <div className="simulator-inputs" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          <div className="input-group">
            <label className="filter-label" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>CURRENT ROUTINE</span>
              {recentActivities.length > 0 && (
                <div className="recent-activity-selector" style={{ fontSize: "0.75rem", fontWeight: "normal" }}>
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        const act = recentActivities.find(a => a.id === e.target.value);
                        if (act) handleLoadRecent(act);
                      }
                      e.target.value = "";
                    }}
                    style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", outline: "none" }}
                  >
                    <option value="">Load recent activity...</option>
                    {recentActivities.map(act => (
                      <option key={act.id} value={act.id}>
                        {ACTIVITY_CONFIGS[act.activityType].displayName} - {act.quantity} {act.unit}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </label>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <select
                className="target-input"
                style={{ flex: "1", minWidth: "140px" }}
                value={currentActivity}
                onChange={(e) => setCurrentActivity(e.target.value as ActivityType)}
                data-testid="what-if-current"
              >
                <option value="">Activity ▼</option>
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {ACTIVITY_CONFIGS[type].displayName}
                  </option>
                ))}
              </select>
              
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: "1", minWidth: "120px" }}>
                <input
                  type="number"
                  className="target-input"
                  style={{ width: "100%" }}
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0"
                  step="any"
                  data-testid="what-if-quantity"
                />
                {currentUnit && <span className="target-unit">{currentUnit}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", color: "var(--color-text-muted)", padding: "1rem 0" }}>
            <ArrowRight size={24} style={{ transform: "rotate(90deg)" }} />
          </div>

          <div className="input-group">
            <label className="filter-label">ALTERNATIVE</label>
            <select
              className="target-input"
              style={{ width: "100%" }}
              value={alternativeActivity}
              onChange={(e) => setAlternativeActivity(e.target.value as ActivityType)}
              disabled={!currentActivity}
              data-testid="what-if-alternative"
            >
              <option value="">Compare ▼</option>
              {availableAlternatives.map((type) => (
                <option key={type} value={type}>
                  {ACTIVITY_CONFIGS[type].displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Scenarios */}
          <div style={{ marginTop: "1rem" }}>
            <label className="filter-label" style={{ fontSize: "0.75rem" }}>QUICK SCENARIOS</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickScenario("car", "bus", "10")}
                data-testid="quick-car-bus"
              >
                Car → Bus
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickScenario("non_veg_meal", "veg_meal", "1")}
                data-testid="quick-nonveg-veg"
              >
                Non-veg → Veg
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setCurrentActivity("");
                  setAlternativeActivity("");
                  setQuantity("");
                }}
              >
                <RefreshCw size={14} style={{ marginRight: "4px" }} /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Result */}
        <div className="simulator-result" style={{ 
          padding: "1.5rem", 
          backgroundColor: "var(--color-bg-secondary)", 
          borderRadius: "var(--radius-md)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          border: "1px solid var(--color-border-light)"
        }}>
          
          {!canCalculate && !warning && (
            <div className="empty-state" style={{ minHeight: "150px", border: "none" }}>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
                {error || "Fill out the fields to see the potential impact."}
              </p>
            </div>
          )}

          {warning && !canCalculate && (
            <div className="nudge-banner" style={{ margin: 0 }}>
              <div className="nudge-header"><AlertTriangle size={18} /> Unusual Value</div>
              <p className="nudge-suggestion">{warning}</p>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: "0.5rem" }}
                onClick={() => setConfirmedUnusual(true)}
              >
                Confirm & Calculate
              </button>
            </div>
          )}

          {canCalculate && (
            <div className="result-display fade-in" aria-live="polite">
              <h4 className="filter-label" style={{ marginBottom: "1rem" }}>POTENTIAL IMPACT</h4>
              
              <div style={{ height: "200px", width: "100%", marginBottom: "1.5rem" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Current', co2: currentCO2, fill: "var(--color-text)" },
                    { name: 'Alternative', co2: alternativeCO2, fill: diff > 0 ? "var(--color-green)" : diff < 0 ? "var(--color-red)" : "var(--color-text-muted)" }
                  ]} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}kg`} />
                    <Tooltip 
                      cursor={{ fill: 'var(--color-bg-tertiary)' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border-light)' }}
                      formatter={(value: any) => [`${Number(value).toFixed(2)} kg CO₂`, 'Footprint']}
                    />
                    <Bar dataKey="co2" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {
                        [0, 1].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "var(--color-text)" : diff > 0 ? "var(--color-green)" : diff < 0 ? "var(--color-red)" : "var(--color-text-muted)"} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: "1.5rem" }}>
                {diff > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-green)", fontFamily: "'Instrument Serif', serif", lineHeight: 1 }}>
                      ↓ {diff.toFixed(2)} kg CO₂
                    </span>
                    <span style={{ color: "var(--color-green)", fontSize: "0.9rem", fontWeight: 500, marginTop: "0.25rem" }}>
                      You could save {diff.toFixed(2)} kg CO₂
                    </span>
                    <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                      Hypothetical projection: ≈ {(diff * 7).toFixed(2)} kg/week if repeated daily
                    </div>
                  </div>
                )}
                {diff === 0 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text)" }}>
                      No change in carbon footprint.
                    </span>
                  </div>
                )}
                {diff < 0 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-red)", lineHeight: 1 }}>
                      ↑ {Math.abs(diff).toFixed(2)} kg CO₂
                    </span>
                    <span style={{ color: "var(--color-red)", fontSize: "0.9rem", fontWeight: 500, marginTop: "0.25rem" }}>
                      This change would increase your footprint by {Math.abs(diff).toFixed(2)} kg CO₂.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
