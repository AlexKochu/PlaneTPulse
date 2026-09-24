// ============================================================
// PlanetPulse — Week Utilities (DP3 Implementation)
// ============================================================
// A "week" runs Monday → Sunday, using the user's local time.
// ============================================================

import { WeekInfo, DailyBreakdown, ActivityRecord } from './types';

/**
 * Get the Monday (start) of the week containing the given date.
 * Week runs Monday → Sunday (DP3).
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // Adjust so Monday = 0
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the Sunday (end) of the week containing the given date.
 */
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Get comprehensive week information for the current date.
 */
export function getCurrentWeekInfo(): WeekInfo {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);

  let dayOfWeek = now.getDay();
  dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert 0(Sun) to 7

  const daysElapsed = dayOfWeek;
  const daysRemaining = 7 - dayOfWeek;

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return {
    weekStart,
    weekEnd,
    dayOfWeek,
    daysElapsed,
    daysRemaining,
    weekLabel: `${formatDate(weekStart)} – ${formatDate(weekEnd)}`,
  };
}

/**
 * Format a Date object to YYYY-MM-DD in local time.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Extract Date object for an activity.
 * Uses stored activity date if present ('YYYY-MM-DD').
 * Safely falls back to creation date (timestamp or createdAt) for existing activities.
 */
export function getActivityDate(activity: { date?: string; timestamp?: string; createdAt?: string }): Date {
  if (activity.date && /^\d{4}-\d{2}-\d{2}$/.test(activity.date)) {
    const [y, m, d] = activity.date.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0); // Local midday to safely avoid edge-of-day DST jumps
  }
  const fallback = activity.timestamp || activity.createdAt || new Date().toISOString();
  return new Date(fallback);
}

/**
 * Extract YYYY-MM-DD date string for an activity in local time.
 * Falls back to creation date (timestamp or createdAt) if not explicitly stored.
 */
export function getActivityDateString(activity: { date?: string; timestamp?: string; createdAt?: string }): string {
  if (activity.date && /^\d{4}-\d{2}-\d{2}$/.test(activity.date)) {
    return activity.date;
  }
  return getLocalDateString(getActivityDate(activity));
}

/**
 * Check if an activity or timestamp falls within the current week (Mon-Sun).
 * Accepts ActivityRecord, Date, or ISO/YYYY-MM-DD date string.
 */
export function isInCurrentWeek(activityOrDate: string | Date | ActivityRecord): boolean {
  let date: Date;
  if (typeof activityOrDate === 'object' && activityOrDate !== null && 'id' in activityOrDate) {
    date = getActivityDate(activityOrDate as ActivityRecord);
  } else if (typeof activityOrDate === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(activityOrDate)) {
      const [y, m, d] = activityOrDate.split('-').map(Number);
      date = new Date(y, m - 1, d, 12, 0, 0);
    } else {
      date = new Date(activityOrDate);
    }
  } else {
    date = new Date(activityOrDate);
  }

  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);
  return date >= weekStart && date <= weekEnd;
}

/**
 * Get the ISO string for the current week's Monday.
 */
export function getCurrentWeekStartISO(): string {
  return getWeekStart(new Date()).toISOString();
}

/**
 * Generate daily breakdown for the current week.
 * Uses stored activity date with safe fallback to creation date.
 */
export function getDailyBreakdown(activities: ActivityRecord[]): DailyBreakdown[] {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const todayStr = getLocalDateString(now);

  const days: DailyBreakdown[] = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    const dayDateStr = getLocalDateString(dayDate);

    const dayActivities = activities.filter(a => {
      const aDateStr = getActivityDateString(a);
      return aDateStr === dayDateStr;
    });

    const co2Kg = dayActivities.reduce((sum, a) => sum + a.co2Kg, 0);

    days.push({
      day: dayNames[i],
      date: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      co2Kg: Math.round(co2Kg * 100) / 100,
      isToday: dayDateStr === todayStr,
    });
  }

  return days;
}

/**
 * Check if an activity or date string is today.
 */
export function isToday(activityOrTimestamp: string | ActivityRecord): boolean {
  const todayStr = getLocalDateString();
  if (typeof activityOrTimestamp === 'object' && activityOrTimestamp !== null && 'id' in activityOrTimestamp) {
    return getActivityDateString(activityOrTimestamp) === todayStr;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(activityOrTimestamp)) {
    return activityOrTimestamp === todayStr;
  }
  return getLocalDateString(new Date(activityOrTimestamp)) === todayStr;
}

/**
 * Format timestamp or activity date for display in history or activity feed.
 */
export function formatTimestamp(activityOrTimestamp: string | ActivityRecord): string {
  if (typeof activityOrTimestamp === 'object' && activityOrTimestamp !== null) {
    const act = activityOrTimestamp as ActivityRecord;
    const dateStr = getActivityDateString(act);
    const todayStr = getLocalDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    const timeStr = act.timestamp
      ? new Date(act.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      : '';

    if (dateStr === todayStr) {
      return timeStr ? `Today, ${timeStr}` : 'Today';
    }
    if (dateStr === yesterdayStr) {
      return timeStr ? `Yesterday, ${timeStr}` : 'Yesterday';
    }

    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return timeStr ? `${formatted}, ${timeStr}` : formatted;
  }

  const date = new Date(activityOrTimestamp);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }

  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
}
