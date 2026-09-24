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

  return record;
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
