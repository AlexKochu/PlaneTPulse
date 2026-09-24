// ============================================================
// PlanetPulse — Unit Tests for Target Equality & Date/Week Boundaries
// ============================================================

import { generateNudge } from '../lib/nudge';
import {
  getWeekStart,
  getWeekEnd,
  isInCurrentWeek,
  getDailyBreakdown,
  getActivityDate,
  getActivityDateString,
  getLocalDateString,
  isToday,
} from '../lib/week';
import { validateActivityDate, validateActivityInput } from '../lib/validation';
import { ActivityRecord } from '../lib/types';

// ============================================================
// 1. Weekly Target Behavior (Equality and Just-Over-Target)
// ============================================================
describe('Weekly Target Behavior', () => {
  const dummyActivities: ActivityRecord[] = [
    {
      id: '1',
      activityType: 'car',
      quantity: 50,
      unit: 'km',
      emissionFactor: 0.20,
      co2Kg: 10,
      category: 'transportation',
      timestamp: new Date().toISOString(),
      date: getLocalDateString(),
    },
  ];

  test('weekly total strictly below target is NOT exceeded', () => {
    const target = 50.0;
    const usage = 49.99;
    const isExceeded = usage > target;
    const percentage = Math.round((usage / target) * 100);
    const nudge = generateNudge(usage, target, dummyActivities);

    expect(isExceeded).toBe(false);
    expect(nudge.show).toBe(false);
    expect(nudge.exceededBy).toBe(0);
    expect(percentage).toBeLessThanOrEqual(100);
  });

  test('weekly total exactly equal to target = 100% but NOT exceeded', () => {
    const target = 50.0;
    const usage = 50.0;
    const isExceeded = usage > target;
    const percentage = Math.round((usage / target) * 100);
    const remaining = Math.max(0, Math.round((target - usage) * 100) / 100);
    const nudge = generateNudge(usage, target, dummyActivities);

    expect(isExceeded).toBe(false);
    expect(percentage).toBe(100);
    expect(remaining).toBe(0);
    expect(nudge.show).toBe(false);
    expect(nudge.exceededBy).toBe(0);
  });

  test('weekly total strictly greater than target (just over target) = exceeded', () => {
    const target = 50.0;
    const usage = 50.01;
    const isExceeded = usage > target;
    const percentage = Math.round((usage / target) * 100);
    const nudge = generateNudge(usage, target, dummyActivities);

    expect(isExceeded).toBe(true);
    expect(percentage).toBeGreaterThanOrEqual(100);
    expect(nudge.show).toBe(true);
    expect(nudge.exceededBy).toBe(0.01);
  });

  test('weekly total well above target = exceeded with correct surplus', () => {
    const target = 25.0;
    const usage = 35.5;
    const isExceeded = usage > target;
    const nudge = generateNudge(usage, target, dummyActivities);

    expect(isExceeded).toBe(true);
    expect(nudge.show).toBe(true);
    expect(nudge.exceededBy).toBe(10.5);
  });

  test('target of zero or negative does not trigger nudge', () => {
    const nudgeZero = generateNudge(10, 0, dummyActivities);
    expect(nudgeZero.show).toBe(false);

    const nudgeNeg = generateNudge(10, -5, dummyActivities);
    expect(nudgeNeg.show).toBe(false);
  });
});

// ============================================================
// 2. Date and Week Boundaries (Monday to Sunday)
// ============================================================
describe('Date and Week Boundaries (DP3)', () => {
  test('week starts on Monday at 00:00:00 and ends on Sunday at 23:59:59', () => {
    const testDate = new Date(2026, 8, 23, 14, 0, 0); // Wednesday, Sep 23, 2026
    const start = getWeekStart(testDate);
    const end = getWeekEnd(testDate);

    // Monday should be day 1
    expect(start.getDay()).toBe(1);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getDate()).toBe(21); // Monday, Sep 21

    // Sunday should be day 0
    expect(end.getDay()).toBe(0);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    expect(end.getDate()).toBe(27); // Sunday, Sep 27
  });

  test('Monday 00:00:00 is inside current week, Sunday 23:59:59 is inside current week', () => {
    const now = new Date();
    const mon = getWeekStart(now);
    const sun = getWeekEnd(now);

    expect(isInCurrentWeek(mon)).toBe(true);
    expect(isInCurrentWeek(sun)).toBe(true);
  });

  test('Previous Sunday 23:59:59 is NOT in current week', () => {
    const now = new Date();
    const mon = getWeekStart(now);
    const prevSun = new Date(mon.getTime() - 1000); // 1 second before Monday start
    expect(isInCurrentWeek(prevSun)).toBe(false);
  });

  test('Next Monday 00:00:00 is NOT in current week', () => {
    const now = new Date();
    const sun = getWeekEnd(now);
    const nextMon = new Date(sun.getTime() + 1000); // 1 second after Sunday end
    expect(isInCurrentWeek(nextMon)).toBe(false);
  });
});

// ============================================================
// 3. Stored Activity Date & Fallback Behavior
// ============================================================
describe('Stored Activity Date and Creation Date Fallback', () => {
  test('getActivityDate extracts date from explicit YYYY-MM-DD date field', () => {
    const activity: ActivityRecord = {
      id: 'test-1',
      activityType: 'bus',
      quantity: 10,
      unit: 'km',
      emissionFactor: 0.08,
      co2Kg: 0.80,
      category: 'transportation',
      timestamp: '2026-09-24T10:00:00.000Z', // created today
      date: '2026-09-20',                  // explicit date in past
    };

    const d = getActivityDate(activity);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8); // September (0-indexed)
    expect(d.getDate()).toBe(20);
    expect(getActivityDateString(activity)).toBe('2026-09-20');
  });

  test('safely falls back to timestamp when date field is undefined', () => {
    const activity: ActivityRecord = {
      id: 'test-legacy',
      activityType: 'flight',
      quantity: 100,
      unit: 'km',
      emissionFactor: 0.25,
      co2Kg: 25.0,
      category: 'transportation',
      timestamp: '2026-09-22T08:30:00.000Z',
    };

    const d = getActivityDate(activity);
    expect(d.getTime()).toBe(new Date('2026-09-22T08:30:00.000Z').getTime());
  });

  test('safely falls back to createdAt when both date and timestamp are absent', () => {
    const activity = {
      createdAt: '2026-09-21T12:00:00.000Z',
    };

    const d = getActivityDate(activity);
    expect(d.getTime()).toBe(new Date('2026-09-21T12:00:00.000Z').getTime());
  });

  test('calculations use stored activity date, not creation date', () => {
    const now = new Date();
    const mon = getWeekStart(now);
    const monStr = getLocalDateString(mon);

    // Activity created today, but date set to Monday of this week
    const activity: ActivityRecord = {
      id: 'test-monday',
      activityType: 'car',
      quantity: 10,
      unit: 'km',
      emissionFactor: 0.20,
      co2Kg: 2.00,
      category: 'transportation',
      timestamp: new Date().toISOString(), // today
      date: monStr,                        // Monday
    };

    const breakdown = getDailyBreakdown([activity]);
    const mondayEntry = breakdown.find(b => b.day === 'Mon');
    expect(mondayEntry).toBeDefined();
    expect(mondayEntry?.co2Kg).toBe(2.00);
  });
});

// ============================================================
// 4. Date Validation (No Future Dates)
// ============================================================
describe('Date Validation Rules', () => {
  test('accepts today local date', () => {
    const todayStr = getLocalDateString();
    const result = validateActivityDate(todayStr);
    expect(result.valid).toBe(true);
  });

  test('accepts past date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    const result = validateActivityDate(yesterdayStr);
    expect(result.valid).toBe(true);
  });

  test('rejects future date', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrow);

    const result = validateActivityDate(tomorrowStr);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('future');
  });

  test('rejects empty date', () => {
    const result = validateActivityDate('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('select an activity date');
  });

  test('validateActivityInput rejects if future date is provided', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrow);

    const result = validateActivityInput('car', 10, tomorrowStr);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('future');
  });

  test('validateActivityInput accepts valid activity and valid date', () => {
    const todayStr = getLocalDateString();
    const result = validateActivityInput('car', 10, todayStr);
    expect(result.valid).toBe(true);
  });
});
