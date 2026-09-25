"use client";

import { useState, useEffect, useCallback } from "react";
import { getFilteredActivities, deleteActivityAsync, type ActivityFilter } from "@/lib/storage";
import { ACTIVITY_CONFIGS, ACTIVITY_TYPES } from "@/lib/calculations";
import { formatTimestamp } from "@/lib/week";
import type { ActivityRecord, ActivityType } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import LiveIndicator from "@/components/LiveIndicator";
import { Search, Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [filter, setFilter] = useState<ActivityFilter>({
    activityType: "all",
    dateRange: "all",
    startDate: "",
    endDate: "",
  });
  const [mounted, setMounted] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<ActivityRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(() => {
    setActivities(getFilteredActivities(filter));
  }, [filter]);

  // Handle Escape key to dismiss confirmation dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activityToDelete && !isDeleting) {
        setActivityToDelete(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activityToDelete, isDeleting]);

  const handleConfirmDelete = async () => {
    if (!activityToDelete) return;
    setIsDeleting(true);
    try {
      await deleteActivityAsync(activityToDelete.id);
      loadData();
    } finally {
      setIsDeleting(false);
      setActivityToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setActivityToDelete(null);
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  // Listen for storage changes (cross-tab via 'storage' and same-tab via 'planetpulse_storage')
  useEffect(() => {
    const handler = () => loadData();
    window.addEventListener("storage", handler);
    window.addEventListener("planetpulse_storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("planetpulse_storage", handler);
    };
  }, [loadData]);

  const clearFilters = () => {
    setFilter({
      activityType: "all",
      dateRange: "all",
      startDate: "",
      endDate: "",
    });
  };

  const hasActiveFilters =
    filter.activityType !== "all" ||
    filter.dateRange !== "all";

  if (!mounted) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">History</h1>
          <p className="page-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title" data-testid="history-title">History</h1>
            <p className="page-subtitle">
              View and filter your logged activities.
            </p>
          </div>
          <LiveIndicator label="AUDIT LOG ACTIVE" />
        </div>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="card filters-card" style={{ marginBottom: "var(--space-xl)", padding: "var(--space-lg)" }}>
          <div className="filters-bar" data-testid="filters-bar" style={{ marginBottom: 0 }}>
            <div className="filter-group">
              <label htmlFor="filter-type" className="filter-label">Activity Type</label>
              <select
                id="filter-type"
                className="filter-select"
                value={filter.activityType || "all"}
                onChange={(e) =>
                  setFilter((f) => ({
                    ...f,
                    activityType: e.target.value as ActivityType | "all",
                  }))
                }
                data-testid="filter-type"
                aria-label="Filter by activity type"
              >
                <option value="all">All Activities</option>
                {ACTIVITY_TYPES.map((type) => {
                  const cfg = ACTIVITY_CONFIGS[type];
                  return (
                    <option key={type} value={type}>
                      {cfg.displayName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-date" className="filter-label">Date Range</label>
              <select
                id="filter-date"
                className="filter-select"
                value={filter.dateRange || "all"}
                onChange={(e) =>
                  setFilter((f) => ({
                    ...f,
                    dateRange: e.target.value as ActivityFilter["dateRange"],
                    startDate: e.target.value !== "custom" ? "" : f.startDate,
                    endDate: e.target.value !== "custom" ? "" : f.endDate,
                  }))
                }
                data-testid="filter-date"
                aria-label="Filter by date range"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {filter.dateRange === "custom" && (
              <>
                <div className="filter-group">
                  <label htmlFor="filter-start" className="filter-label">From</label>
                  <input
                    id="filter-start"
                    type="date"
                    className="filter-input"
                    value={filter.startDate || ""}
                    onChange={(e) =>
                      setFilter((f) => ({ ...f, startDate: e.target.value }))
                    }
                    data-testid="filter-from"
                    aria-label="Start date"
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="filter-end" className="filter-label">To</label>
                  <input
                    id="filter-end"
                    type="date"
                    className="filter-input"
                    value={filter.endDate || ""}
                    onChange={(e) =>
                      setFilter((f) => ({ ...f, endDate: e.target.value }))
                    }
                    data-testid="filter-to"
                    aria-label="End date"
                  />
                </div>
              </>
            )}

            {hasActiveFilters && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={clearFilters}
                data-testid="clear-filters"
                style={{ alignSelf: "flex-end" }}
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Results count */}
      <p className="stat-detail" style={{ marginBottom: "var(--space-md)" }}>
        {activities.length} {activities.length === 1 ? "activity" : "activities"} found
      </p>

      {activities.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
          {/* Desktop Table */}
          <div className="card history-table-container" data-testid="history-table">
            <table className="history-table" role="table">
              <thead>
                <tr>
                  <th scope="col">Date / Time</th>
                  <th scope="col">Activity</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Unit</th>
                  <th scope="col">CO₂</th>
                  <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody data-testid="history-list">
                <AnimatePresence mode="popLayout">
                  {activities.map((activity, i) => {
                    const cfg = ACTIVITY_CONFIGS[activity.activityType];
                    return (
                      <motion.tr 
                        key={activity.id} 
                        data-testid="history-row"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                      >
                        <td>{formatTimestamp(activity)}</td>
                        <td>
                          <div className="history-activity">
                            <span className="history-activity-icon">{cfg.icon}</span>
                            {cfg.displayName}
                          </div>
                        </td>
                        <td>{activity.quantity}</td>
                        <td>{activity.unit}</td>
                        <td className="history-co2">
                          {activity.co2Kg.toFixed(2)} kg
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="btn-delete-row"
                            onClick={() => setActivityToDelete(activity)}
                            title={`Delete ${cfg.displayName} activity`}
                            aria-label={`Delete ${cfg.displayName} activity`}
                            data-testid={`delete-activity-${activity.id}`}
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="history-cards" data-testid="history-cards">
            <AnimatePresence>
              {activities.map((activity, i) => {
                const cfg = ACTIVITY_CONFIGS[activity.activityType];
                return (
                  <motion.div 
                    className="history-card-item" 
                    key={activity.id} 
                    data-testid="history-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                  >
                    <div className="history-card-top">
                      <div className="history-card-activity">
                        <span>{cfg.icon}</span>
                        {cfg.displayName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div className="history-card-co2">
                          {activity.co2Kg.toFixed(2)} kg CO₂
                        </div>
                        <button
                          type="button"
                          className="btn-delete-mobile"
                          onClick={() => setActivityToDelete(activity)}
                          title={`Delete ${cfg.displayName} activity`}
                          aria-label={`Delete ${cfg.displayName} activity`}
                          data-testid={`delete-mobile-${activity.id}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <div className="history-card-bottom">
                      <span>
                        {activity.quantity} {activity.unit}
                      </span>
                      <span>{formatTimestamp(activity)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <div className="card" data-testid="empty-state">
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={32} /></div>
              <h4>No activities found</h4>
              <p>
                {hasActiveFilters
                  ? "No activities found for these filters. Try adjusting your filters or clearing them."
                  : "You haven't logged any activities yet. Start by logging your first activity."}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {activityToDelete && (
          <div
            className="confirmation-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isDeleting) {
                handleCancelDelete();
              }
            }}
          >
            <motion.div
              className="confirmation-dialog"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div className="confirmation-icon" style={{ color: "var(--color-danger)" }}>
                <Trash2 size={32} />
              </div>
              <h3 id="delete-confirm-title">Delete Activity</h3>
              <p data-testid="delete-confirmation-message" style={{ marginBottom: "var(--space-md)" }}>
                Are you sure you want to delete this activity?
              </p>

              {(() => {
                const delCfg = ACTIVITY_CONFIGS[activityToDelete.activityType];
                return (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      background: "rgba(190, 88, 63, 0.07)",
                      border: "1px solid rgba(190, 88, 63, 0.2)",
                      borderRadius: "8px",
                      marginBottom: "var(--space-xl)",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{delCfg?.icon}</span>
                      <strong>{delCfg?.displayName}</strong>
                      <span style={{ color: "var(--color-text-muted)" }}>
                        ({activityToDelete.quantity} {activityToDelete.unit})
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-danger)" }}>
                      {activityToDelete.co2Kg.toFixed(2)} kg CO₂
                    </div>
                  </div>
                );
              })()}

              <div className="confirmation-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  data-testid="delete-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  data-testid="delete-confirm"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
