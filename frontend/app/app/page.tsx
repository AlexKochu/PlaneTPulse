"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllActivities,
  getCurrentWeekActivities,
  getCurrentWeekTotal,
  getAllTimeTotal,
  getWeeklyTarget,
  setWeeklyTarget,
} from "@/lib/storage";
import { ACTIVITY_CONFIGS, CATEGORY_CONFIG, formatCO2 } from "@/lib/calculations";
import { getCurrentWeekInfo, getDailyBreakdown, formatTimestamp } from "@/lib/week";
import { generateNudge } from "@/lib/nudge";
import type {
  ActivityRecord,
  WeeklyTarget,
  WeekInfo,
  CategoryBreakdown,
  DailyBreakdown,
  NudgeInfo,
  ActivityCategory,
} from "@/lib/types";
import CategoryChart from "@/components/CategoryChart";
import WeeklyTrendChart from "@/components/WeeklyTrendChart";
import WeeklyCoach from "@/components/WeeklyCoach";
import { Reveal, HoverLift, CountUp } from "@/components/Motion";
import LiveIndicator from "@/components/LiveIndicator";
import { AlertTriangle, BarChart2, ClipboardList, PlusCircle, TrendingUp, Globe2, CloudRain, Sun } from 'lucide-react';

export default function DashboardPage() {
  const [view, setView] = useState<"week" | "all">("week");
  const [weekTotal, setWeekTotal] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [target, setTarget] = useState<WeeklyTarget | null>(null);
  const [targetInput, setTargetInput] = useState("");
  const [weekInfo, setWeekInfo] = useState<WeekInfo | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [dailyData, setDailyData] = useState<DailyBreakdown[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityRecord[]>([]);
  const [nudge, setNudge] = useState<NudgeInfo>({
    show: false,
    exceededBy: 0,
    suggestion: "",
    topCategory: null,
  });
  const [mounted, setMounted] = useState(false);

  const loadData = useCallback(() => {
    const wTotal = getCurrentWeekTotal();
    const aTotal = getAllTimeTotal();
    const wTarget = getWeeklyTarget();
    const wInfo = getCurrentWeekInfo();
    const weekActivities = getCurrentWeekActivities();
    const allActivities = getAllActivities();

    setWeekTotal(wTotal);
    setAllTotal(aTotal);
    setTarget(wTarget);
    setTargetInput(wTarget ? String(wTarget.targetKg) : "50");
    setWeekInfo(wInfo);
    setRecentActivities(allActivities.slice(0, 5));
    setDailyData(getDailyBreakdown(weekActivities));

    const sourceActivities = view === "week" ? weekActivities : allActivities;
    const catTotals: Record<ActivityCategory, number> = { transportation: 0, electricity: 0, food: 0 };
    for (const a of sourceActivities) catTotals[a.category] += a.co2Kg;
    const totalForBreakdown = Object.values(catTotals).reduce((s, v) => s + v, 0);
    
    setCategoryData((Object.keys(catTotals) as ActivityCategory[]).map((cat) => ({
      category: cat, label: CATEGORY_CONFIG[cat].label,
      co2Kg: Math.round(catTotals[cat] * 100) / 100,
      percentage: totalForBreakdown > 0 ? Math.round((catTotals[cat] / totalForBreakdown) * 100) : 0,
      color: CATEGORY_CONFIG[cat].color,
    })));

    if (wTarget && wTarget.targetKg > 0) {
      setNudge(generateNudge(wTotal, wTarget.targetKg, weekActivities));
    } else {
      setNudge({ show: false, exceededBy: 0, suggestion: "", topCategory: null });
    }
  }, [view]);

  useEffect(() => { setMounted(true); loadData(); }, [loadData]);

  useEffect(() => {
    const handler = () => loadData();
    window.addEventListener("storage", handler);
    window.addEventListener("planetpulse_storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("planetpulse_storage", handler);
    };
  }, [loadData]);

  const handleSaveTarget = () => {
    const val = parseFloat(targetInput);
    if (isNaN(val) || val <= 0) return;
    setWeeklyTarget(val);
    loadData();
  };

  if (!mounted) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Loading your carbon footprint data...</p>
        </div>
      </div>
    );
  }

  const displayTotal = view === "week" ? weekTotal : allTotal;
  const percentage = target && target.targetKg > 0 ? Math.round((weekTotal / target.targetKg) * 100) : 0;
  const remaining = target ? Math.max(0, Math.round((target.targetKg - weekTotal) * 100) / 100) : 0;
  const exceeded = target ? weekTotal > target.targetKg : false;
  const nearLimit = percentage >= 80 && !exceeded;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title" data-testid="dashboard-title">Dashboard</h1>
            <p className="page-subtitle">
              {weekInfo ? `Week: ${weekInfo.weekLabel} · Day ${weekInfo.daysElapsed} of 7` : "Your carbon footprint overview"}
            </p>
          </div>
          <LiveIndicator label="LIVE EMISSIONS ENGINE" />
        </div>
      </div>

      <AnimatePresence>
        {nudge.show && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="nudge-banner" data-testid="target-exceeded-banner" role="alert"
          >
            <div className="nudge-header">
              <AlertTriangle size={18} /> Weekly target exceeded by {nudge.exceededBy.toFixed(2)} kg CO₂
            </div>
            <p className="nudge-suggestion">{nudge.suggestion}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <WeeklyCoach />

      <div className="dashboard-grid">
        <Reveal direction="up" delay={0.05} className="dashboard-grid-cell">
          <HoverLift className="card dashboard-card-full-height" data-testid="total-footprint-card">
            <div>
              <div className="card-header">
                <span className="card-title">Total Footprint</span>
                <div className="view-toggle">
                  <button className={`view-toggle-btn ${view === "week" ? "active" : ""}`} onClick={() => setView("week")} data-testid="toggle-week">This Week</button>
                  <button className={`view-toggle-btn ${view === "all" ? "active" : ""}`} onClick={() => setView("all")} data-testid="toggle-all">All Time</button>
                </div>
              </div>
              
              <div className="stat-value" data-testid="total-footprint">
                <CountUp to={displayTotal} duration={0.6} decimals={2} />
                <span className="stat-unit">CO₂</span>
              </div>
              
              <p className="stat-detail">
                {view === "week" ? `${getCurrentWeekActivities().length} activities logged this week` : `${getAllActivities().length} total activities recorded`}
              </p>

              <div className="mini-category-breakdown">
                <div className="mini-breakdown-title"><TrendingUp size={14} /> Category Distribution</div>
                <div className="mini-category-bars">
                  {categoryData.map((cat) => (
                    <div key={cat.category} className="mini-category-row">
                      <div className="mini-cat-header">
                        <span className="mini-cat-name">{cat.label}</span>
                        <span className="mini-cat-val">{cat.co2Kg.toFixed(1)} kg ({cat.percentage}%)</span>
                      </div>
                      <div className="mini-bar-track">
                        <motion.div className="mini-bar-fill" initial={{ width: 0 }} animate={{ width: `${Math.max(cat.percentage, cat.co2Kg > 0 ? 4 : 0)}%` }} style={{ backgroundColor: cat.color }} transition={{ duration: 0.6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-action-footer">
              <Link href="/app/log" className="btn btn-secondary btn-sm" style={{ width: "100%" }}><PlusCircle size={16} /> Log New Activity</Link>
            </div>
          </HoverLift>
        </Reveal>

        <Reveal direction="up" delay={0.1} className="dashboard-grid-cell">
          <HoverLift className="card dashboard-card-full-height" data-testid="weekly-target-card">
            <div>
              <div className="card-header">
                <span className="card-title">Weekly Target</span>
                {target && <span className={`card-badge ${exceeded ? "card-badge-red" : "card-badge-green"}`}>{exceeded ? "Exceeded" : `${percentage}%`}</span>}
              </div>

              {target && target.targetKg > 0 ? (
                <div className="target-progress" data-testid="target-progress">
                  <div className="stat-value" data-testid="weekly-usage">
                    <CountUp to={weekTotal} duration={0.6} decimals={1} />
                    <span className="stat-unit">/ {target.targetKg} kg CO₂ ({percentage}%)</span>
                  </div>

                  <div className="progress-bar-container">
                    <div className="progress-bar-bg">
                      <motion.div className={`progress-bar-fill ${exceeded ? "exceeded" : ""}`} initial={{ width: 0 }} animate={{ width: `${Math.min(percentage, 100)}%` }} transition={{ duration: 0.6 }} data-testid="progress-bar" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} />
                    </div>
                    <div className="progress-bar-labels"><span>0 kg</span><span>{target.targetKg} kg</span></div>
                  </div>

                  <div className="progress-stats">
                    <div className="progress-stat"><div className="progress-stat-value">{percentage}%</div><div className="progress-stat-label">Used</div></div>
                    <div className="progress-stat"><div className="progress-stat-value">{exceeded ? `+${nudge.exceededBy.toFixed(1)}` : remaining.toFixed(1)} kg</div><div className="progress-stat-label">{exceeded ? "Exceeded" : "Remaining"}</div></div>
                    <div className="progress-stat"><div className="progress-stat-value">{weekInfo ? weekInfo.daysRemaining : "-"}</div><div className="progress-stat-label">Days Left</div></div>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: "var(--space-md)" }}><p className="stat-detail">Set a weekly CO₂ target to track your progress and receive intelligent nudges.</p></div>
              )}
            </div>
            
            {target && (
              <div style={{ marginTop: "1rem", display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: exceeded ? 'rgba(239, 68, 68, 0.1)' : nearLimit ? 'rgba(245, 158, 11, 0.1)' : 'rgba(31, 157, 107, 0.1)' }}>
                {exceeded ? <CloudRain style={{ color: '#EF4444' }} /> : nearLimit ? <Sun style={{ color: '#F59E0B' }} /> : <Globe2 style={{ color: 'var(--color-emerald)' }} />}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: exceeded ? '#EF4444' : nearLimit ? '#F59E0B' : 'var(--color-emerald)' }}>
                    {exceeded ? "Overheated" : nearLimit ? "Getting Warm" : "Balanced"}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {exceeded ? "Target exceeded. Let's make greener choices tomorrow." : nearLimit ? "Nearing your target limit. Consider walking or biking!" : "Your ecosystem is thriving within the target."}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: "var(--space-lg)", borderTop: "1px solid var(--color-border-light)", paddingTop: "var(--space-md)" }}>
              <div className="target-setting">
                <div className="target-input-group">
                  <label htmlFor="target-input" className="filter-label">Weekly Target</label>
                  <input id="target-input" type="number" className="target-input" value={targetInput} onChange={(e) => setTargetInput(e.target.value)} min="1" step="1" data-testid="target-input" aria-label="Weekly CO₂ target in kg" />
                  <p className="target-unit">kg CO₂ per week</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleSaveTarget} data-testid="target-save">Save Target</button>
              </div>
            </div>
          </HoverLift>
        </Reveal>
      </div>

      <div className="dashboard-charts">
        <Reveal direction="up" delay={0.15} className="dashboard-grid-cell">
          <HoverLift className="card dashboard-card-full-height" data-testid="category-breakdown">
            <div className="card-header"><span className="card-title">Category Breakdown</span><span className="card-badge card-badge-green">{view === "week" ? "This Week" : "All Time"}</span></div>
            {categoryData.some((c) => c.co2Kg > 0) ? <CategoryChart data={categoryData} /> : <div className="empty-state"><div className="empty-state-icon"><BarChart2 size={32} /></div><h4>No data yet</h4><p>Log your first activity to see your category breakdown.</p></div>}
          </HoverLift>
        </Reveal>

        <Reveal direction="up" delay={0.2} className="dashboard-grid-cell">
          <HoverLift className="card dashboard-card-full-height" data-testid="weekly-trend-card">
            <div className="card-header"><span className="card-title">Weekly Trend</span><span className="card-badge card-badge-green">Mon – Sun</span></div>
            <WeeklyTrendChart data={dailyData} />
          </HoverLift>
        </Reveal>
      </div>

      <Reveal direction="up" delay={0.25}>
        <HoverLift className="card" data-testid="recent-activities-card">
          <div className="card-header"><span className="card-title">Recent Activities</span></div>
          {recentActivities.length > 0 ? (
            <div className="recent-list">
              {recentActivities.map((activity, i) => {
                const config = ACTIVITY_CONFIGS[activity.activityType];
                return (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }} className="recent-item" key={activity.id} data-testid="recent-activity-item">
                    <div className={`recent-icon ${activity.category}`}>{config.icon}</div>
                    <div className="recent-details">
                      <div className="recent-name">{config.displayName}</div>
                      <div className="recent-meta">{activity.quantity} {activity.unit} · {formatTimestamp(activity.timestamp)}</div>
                    </div>
                    <div className="recent-co2"><div className="recent-co2-value">{activity.co2Kg.toFixed(2)}</div><div className="recent-co2-label">kg CO₂</div></div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-icon"><ClipboardList size={32} /></div><h4>No activities logged yet</h4><p>Start by logging your first activity to see it here.</p></div>
          )}
        </HoverLift>
      </Reveal>
    </motion.div>
  );
}
