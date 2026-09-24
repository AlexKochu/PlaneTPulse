"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ACTIVITY_CONFIGS,
  ACTIVITY_TYPES,
  calculateCO2,
} from "@/lib/calculations";
import { validateActivityInput } from "@/lib/validation";
import { saveActivity } from "@/lib/storage";
import { getLocalDateString } from "@/lib/week";
import type { ActivityType } from "@/lib/types";
import ScrollReveal from "@/components/ScrollReveal";
import LiveIndicator from "@/components/LiveIndicator";
import { AlertTriangle, CheckCircle, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

export default function LogActivityPage() {
  const router = useRouter();
  const [activityType, setActivityType] = useState<ActivityType | "">("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(getLocalDateString());
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const config = activityType ? ACTIVITY_CONFIGS[activityType] : null;
  const quantityNum = parseFloat(quantity);
  const co2Result =
    config && !isNaN(quantityNum) && quantityNum > 0
      ? calculateCO2(activityType as ActivityType, quantityNum)
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = validateActivityInput(activityType, quantity, date);

    if (!validation.valid && !validation.requiresConfirmation) {
      setError(validation.error || "Invalid input.");
      return;
    }

    if (validation.requiresConfirmation) {
      setConfirmationMessage(validation.confirmationMessage || "");
      setShowConfirmation(true);
      return;
    }

    doSave();
  };

  const doSave = () => {
    if (!activityType || !quantity) return;

    saveActivity(activityType as ActivityType, parseFloat(quantity), date);

    // Show success
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form
    setActivityType("");
    setQuantity("");
    setDate(getLocalDateString());
    setError("");
    setShowConfirmation(false);
    setShowExplainer(false);
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    doSave();
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmationMessage("");
  };

  if (!mounted) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Log Activity</h1>
          <p className="page-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  const todayStr = getLocalDateString();

  return (
    <div className="log-page-wrapper">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title" data-testid="log-title">Log Activity</h1>
            <p className="page-subtitle">
              Record an activity to calculate its verified carbon footprint in real-time.
            </p>
          </div>
          <LiveIndicator label="CALCULATOR ACTIVE" />
        </div>
      </div>

      <div className="log-page-grid">
        {/* Left Column: Form Inputs */}
        <div className="log-form-column">
          <ScrollReveal direction="up" delay={0.05}>
            <div className="card log-glass-card">
              <form onSubmit={handleSubmit} data-testid="log-form" noValidate>
                {/* Activity Type Selection Grid */}
                <div className="form-group">
                  <label className="form-label" id="activity-type-label">
                    1. Select Activity Type
                  </label>
                  <div className="activity-choices-grid" role="group" aria-labelledby="activity-type-label">
                    {ACTIVITY_TYPES.map((type) => {
                      const cfg = ACTIVITY_CONFIGS[type];
                      return (
                        <button
                          key={type}
                          type="button"
                          className={`activity-choice-card ${activityType === type ? 'active' : ''}`}
                          onClick={() => {
                            setActivityType(type);
                            setError("");
                            setShowExplainer(false);
                          }}
                          aria-pressed={activityType === type}
                          data-testid={`activity-choice-${type}`}
                        >
                          <div className={`activity-choice-icon ${cfg.category}`}>{cfg.icon}</div>
                          <div className="activity-choice-name">{cfg.displayName}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Emission Factor Display */}
                {config && (
                  <div className="emission-factor-display" data-testid="emission-factor">
                    <span className="emission-factor-label">
                      Emission Factor for {config.displayName}
                    </span>
                    <span className="emission-factor-value">
                      {config.emissionFactor.toFixed(2)} kg CO₂ / {config.unit}
                    </span>
                  </div>
                )}

                {/* Quantity */}
                <div className="form-group">
                  <label htmlFor="quantity" className="form-label">
                    2. Quantity {config ? `(${config.unit})` : ""}
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    className="form-input"
                    placeholder={config ? `Enter ${config.unit} (e.g. 25)...` : "Select an activity first"}
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      setError("");
                    }}
                    min="0"
                    step="any"
                    data-testid="quantity-input"
                    aria-label={`Quantity in ${config?.unit || "units"}`}
                    disabled={!activityType}
                    required
                  />
                  {config && (
                    <p className="form-hint">
                      Enter the total {config.unit} for this {config.displayName.toLowerCase()} activity.
                    </p>
                  )}
                </div>

                {/* Date Field */}
                <div className="form-group">
                  <label htmlFor="activity-date" className="form-label">
                    3. Activity Date
                  </label>
                  <input
                    id="activity-date"
                    type="date"
                    className="form-input"
                    value={date}
                    max={todayStr}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setError("");
                    }}
                    data-testid="date-input"
                    aria-label="Activity date"
                    required
                  />
                  <p className="form-hint">
                    Select the date the activity occurred (defaults to today; future dates not allowed).
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="form-error" data-testid="error-message" role="alert">
                    <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%", marginTop: "var(--space-md)" }}
                  disabled={!activityType || !quantity}
                  data-testid="submit-activity"
                >
                  Log Activity <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column: Live Estimated Footprint Summary */}
        <div className="log-preview-column">
          <ScrollReveal direction="up" delay={0.15}>
            <div className="sticky-preview-wrapper">
              {co2Result ? (
                /* Live CO₂ Preview when calculated */
                <div className="co2-preview glass-preview-card" data-testid="co2-preview">
                  <div className="preview-top-badge">
                    <LiveIndicator label="REAL-TIME ESTIMATE" />
                  </div>
                  <div className="co2-preview-label">Estimated Footprint</div>
                  <div className="co2-preview-value">
                    {co2Result.co2Kg.toFixed(2)}
                    <span className="co2-preview-unit">kg CO₂</span>
                  </div>
                  
                  <div className="co2-preview-calc">
                    {quantityNum} {config?.unit} × {config?.emissionFactor.toFixed(2)} kg CO₂/{config?.unit} = {co2Result.co2Kg.toFixed(2)} kg CO₂
                  </div>

                  <div className="co2-preview-divider" />

                  <div className="co2-quick-insights">
                    <div className="insight-row">
                      <span className="insight-label">Category</span>
                      <span className="insight-value" style={{ textTransform: 'capitalize' }}>{config?.category}</span>
                    </div>
                    <div className="insight-row">
                      <span className="insight-label">Rate</span>
                      <span className="insight-value">{config?.emissionFactor.toFixed(2)} kg / {config?.unit}</span>
                    </div>
                    <div className="insight-row">
                      <span className="insight-label">Activity Date</span>
                      <span className="insight-value">{date}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm explainer-toggle-btn"
                    onClick={() => setShowExplainer(!showExplainer)}
                    data-testid="toggle-explainer"
                  >
                    <HelpCircle size={15} />
                    {showExplainer ? "Hide Calculation Breakdown" : "How was this calculated?"}
                  </button>

                  {/* Calculation Explainer (DP3) */}
                  {showExplainer && (
                    <div className="calc-explainer" data-testid="calc-explainer">
                      <div className="calc-explainer-formula">
                        CO₂ (kg) = Quantity ({config?.unit}) × Emission Factor
                      </div>
                      <div className="calc-explainer-row">
                        <span>Activity:</span>
                        <span>{config?.displayName} ({config?.category})</span>
                      </div>
                      <div className="calc-explainer-row">
                        <span>Quantity:</span>
                        <span>{quantityNum} {config?.unit}</span>
                      </div>
                      <div className="calc-explainer-row">
                        <span>Emission Factor:</span>
                        <span>{config?.emissionFactor.toFixed(2)} kg CO₂ / {config?.unit}</span>
                      </div>
                      <div className="calc-explainer-row result">
                        <span>Total CO₂:</span>
                        <span>{co2Result.co2Kg.toFixed(2)} kg CO₂</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Placeholder card when user hasn't chosen activity/quantity */
                <div className="card log-preview-placeholder">
                  <div className="placeholder-icon">
                    <Sparkles size={36} />
                  </div>
                  <h3 className="placeholder-title">Live Footprint Preview</h3>
                  <p className="placeholder-desc">
                    Select an activity type and enter a quantity on the left to see the instant CO₂ calculation.
                  </p>
                  <div className="placeholder-specs">
                    <div className="spec-item">
                      <span className="spec-dot" />
                      <span>Verified deterministic emission factors</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-dot" />
                      <span>Instant real-time CO₂ computation</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-dot" />
                      <span>Weekly target progress synchronization</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* DP2 — Confirmation Dialog for unusually high values */}
      {showConfirmation && (
        <div className="confirmation-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="confirmation-dialog">
            <div className="confirmation-icon" style={{ color: 'var(--color-warning)' }}>
              <AlertTriangle size={32} />
            </div>
            <h3 id="confirm-title">Unusually High Value</h3>
            <p data-testid="confirmation-message">{confirmationMessage}</p>
            <div className="confirmation-actions">
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                data-testid="confirm-cancel"
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
                data-testid="confirm-proceed"
              >
                Yes, Save Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="success-toast" role="status" data-testid="success-toast">
          <CheckCircle size={18} /> Activity logged successfully!
        </div>
      )}
    </div>
  );
}
