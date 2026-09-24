"use client";

import { useState, useEffect, useCallback } from "react";
import { getFilteredActivities, type ActivityFilter } from "@/lib/storage";
import { ACTIVITY_CONFIGS, ACTIVITY_TYPES } from "@/lib/calculations";
import { formatTimestamp } from "@/lib/week";
import type { ActivityRecord, ActivityType } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import LiveIndicator from "@/components/LiveIndicator";
import { Search } from 'lucide-react';

export default function HistoryPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [filter, setFilter] = useState<ActivityFilter>({
    activityType: "all",
    dateRange: "all",
    startDate: "",
    endDate: "",
  });
  const [mounted, setMounted] = useState(false);

  const loadData = useCallback(() => {
    setActivities(getFilteredActivities(filter));
  }, [filter]);

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
                      <div className="history-card-co2">
                        {activity.co2Kg.toFixed(2)} kg CO₂
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
    </motion.div>
  );
}
