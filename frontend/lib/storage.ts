// ============================================================
// PlanetPulse — Data Storage (localStorage)
// ============================================================
// Uses localStorage for persistence. No authentication required.
// The app is immediately usable when opened.
// ============================================================

import { ActivityRecord, WeeklyTarget, ActivityType } from './types';
import { calculateCO2, getActivityConfig } from './calculations';
import {
  getCurrentWeekStartISO,
  isInCurrentWeek,
  getLocalDateString,
  getActivityDateString,
} from './week';

import { API_BASE_URL } from './apiConfig';
import { createActivity, deleteActivity as deleteBackendActivity, getActivities } from './api';

const STORAGE_KEYS = {
  ACTIVITIES: 'planetpulse_activities',
  WEEKLY_TARGET: 'planetpulse_weekly_target',
} as const;

/**
 * Dispatch an event to notify same-tab listeners of storage mutations.
 */
export function notifyStorageChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('planetpulse_storage'));
  }
}

/**
 * Generate a unique ID for records.
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================
// Activity CRUD
// ============================================================

/**
 * Get all stored activities.
 */
export function getAllActivities(): ActivityRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save a new activity and return the created record.
 * Accepts optional activity date string (YYYY-MM-DD). Defaults to today's local date.
 */
export function saveActivity(
  activityType: ActivityType,
  quantity: number,
  date?: string
): ActivityRecord {
  const config = getActivityConfig(activityType);
  const calc = calculateCO2(activityType, quantity);
  const now = new Date();
  const nowISO = now.toISOString();

  // If date is not provided, default to today's local date
  const activityDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getLocalDateString(now);

  const record: ActivityRecord = {
    id: generateId(),
    activityType,
    quantity,
    unit: config.unit,
    emissionFactor: config.emissionFactor,
    co2Kg: calc.co2Kg,
    category: config.category,
    timestamp: nowISO,
    createdAt: nowISO,
    date: activityDate,
  };

  const activities = getAllActivities();
  activities.unshift(record); // newest first
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));

  notifyStorageChange();

  // Async backend sync if API URL is configured
  if (typeof window !== 'undefined' && API_BASE_URL) {
    createActivity(activityType, config.category, quantity, config.unit, activityDate)
      .then((backendActivity) => {
        if (backendActivity?.id) {
          const stored = getAllActivities();
          const found = stored.find(a => a.id === record.id);
          if (found) {
            found.backendId = backendActivity.id;
            localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(stored));
          }
        }
      })
      .catch((err) => {
        console.warn("Backend activity sync skipped/failed:", err);
      });
  }

  return record;
}

/**
 * Helper to delete an activity record from the backend database if configured.
 */
async function deleteBackendActivityRecord(record: ActivityRecord): Promise<void> {
  if (!API_BASE_URL) return;

  try {
    if (record.backendId) {
      await deleteBackendActivity(record.backendId);
      return;
    }

    const numericId = parseInt(record.id, 10);
    if (!isNaN(numericId) && String(numericId) === record.id) {
      await deleteBackendActivity(numericId);
      return;
    }

    // If no backendId is attached, look up activity by attributes on backend
    const backendList = await getActivities(record.activityType).catch(() => []);
    if (Array.isArray(backendList)) {
      const match = backendList.find(
        (b: any) =>
          b.activity_type === record.activityType &&
          Math.abs(b.quantity - record.quantity) < 0.001 &&
          (!record.date || b.date === record.date)
      );
      if (match?.id) {
        await deleteBackendActivity(match.id);
      }
    }
  } catch (e) {
    console.warn("deleteBackendActivityRecord error:", e);
  }
}

/**
 * Delete an activity by ID.
 * Removes the activity from localStorage and dispatches storage change event
 * so that Dashboard totals and other views immediately recalculate.
 * Also removes the activity from the production backend/database if available.
 */
export function deleteActivity(id: string): ActivityRecord | null {
  if (typeof window === 'undefined') return null;

  const activities = getAllActivities();
  const index = activities.findIndex(a => a.id === id);
  if (index === -1) return null;

  const [deleted] = activities.splice(index, 1);
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  notifyStorageChange();

  // Async backend removal if API URL is configured
  if (API_BASE_URL) {
    deleteBackendActivityRecord(deleted).catch(err => {
      console.warn("Backend deletion non-fatal notice:", err);
    });
  }

  return deleted;
}

/**
 * Async version of deleteActivity that awaits backend removal.
 */
export async function deleteActivityAsync(id: string): Promise<ActivityRecord | null> {
  if (typeof window === 'undefined') return null;

  const activities = getAllActivities();
  const index = activities.findIndex(a => a.id === id);
  if (index === -1) return null;

  const [deleted] = activities.splice(index, 1);
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  notifyStorageChange();

  // Backend removal
  if (API_BASE_URL) {
    try {
      await deleteBackendActivityRecord(deleted);
    } catch (err) {
      console.warn("Backend deletion notice:", err);
    }
  }

  return deleted;
}

/**
 * Get activities for the current week using the stored activity date (or fallback).
 */
export function getCurrentWeekActivities(): ActivityRecord[] {
  return getAllActivities().filter(a => isInCurrentWeek(a));
}

/**
 * Get total CO₂ for the current week.
 */
export function getCurrentWeekTotal(): number {
  const activities = getCurrentWeekActivities();
  return Math.round(activities.reduce((sum, a) => sum + a.co2Kg, 0) * 100) / 100;
}

/**
 * Get total CO₂ for all activities.
 */
export function getAllTimeTotal(): number {
  const activities = getAllActivities();
  return Math.round(activities.reduce((sum, a) => sum + a.co2Kg, 0) * 100) / 100;
}

// ============================================================
// Weekly Target
// ============================================================

/**
 * Get the current weekly target.
 */
export function getWeeklyTarget(): WeeklyTarget | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_TARGET);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Set/update the weekly target.
 */
export function setWeeklyTarget(targetKg: number): WeeklyTarget {
  const existing = getWeeklyTarget();
  const now = new Date().toISOString();

  const target: WeeklyTarget = {
    targetKg,
    weekStart: getCurrentWeekStartISO(),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  localStorage.setItem(STORAGE_KEYS.WEEKLY_TARGET, JSON.stringify(target));
  notifyStorageChange();
  return target;
}

// ============================================================
// Filtering
// ============================================================

export interface ActivityFilter {
  activityType?: ActivityType | 'all';
  dateRange?: 'all' | 'today' | 'this_week' | 'custom';
  startDate?: string;
  endDate?: string;
}

/**
 * Get filtered activities using stored activity date with fallback to creation date.
 */
export function getFilteredActivities(filter: ActivityFilter): ActivityRecord[] {
  let activities = getAllActivities();

  // Filter by activity type
  if (filter.activityType && filter.activityType !== 'all') {
    activities = activities.filter(a => a.activityType === filter.activityType);
  }

  // Filter by date range (using stored activity date, fallback to creation date)
  if (filter.dateRange && filter.dateRange !== 'all') {
    switch (filter.dateRange) {
      case 'today': {
        const todayStr = getLocalDateString();
        activities = activities.filter(a => getActivityDateString(a) === todayStr);
        break;
      }
      case 'this_week': {
        activities = activities.filter(a => isInCurrentWeek(a));
        break;
      }
      case 'custom': {
        if (filter.startDate) {
          activities = activities.filter(a => getActivityDateString(a) >= filter.startDate!);
        }
        if (filter.endDate) {
          activities = activities.filter(a => getActivityDateString(a) <= filter.endDate!);
        }
        break;
      }
    }
  }

  return activities;
}
