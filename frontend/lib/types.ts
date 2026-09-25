// ============================================================
// PlanetPulse — Core Types
// ============================================================
import React from 'react';

export type ActivityType = 
  | 'car' 
  | 'bus' 
  | 'flight' 
  | 'electricity' 
  | 'veg_meal' 
  | 'non_veg_meal';

export type ActivityCategory = 'transportation' | 'electricity' | 'food';

export interface ActivityConfig {
  key: ActivityType;
  displayName: string;
  unit: string;
  category: ActivityCategory;
  emissionFactor: number; // kg CO₂ per unit
  icon: React.ReactNode;
  // Validation limits
  maxReject: number;      // Values above this are rejected outright
  maxWarn: number;         // Values above this trigger confirmation
}

export interface ActivityRecord {
  id: string;
  activityType: ActivityType;
  quantity: number;
  unit: string;
  emissionFactor: number;
  co2Kg: number;
  category: ActivityCategory;
  timestamp: string; // ISO string (creation time)
  date?: string;      // YYYY-MM-DD (stored activity date)
  createdAt?: string; // Optional creation timestamp fallback
  backendId?: number; // Backend database ID when synced
}

export interface WeeklyTarget {
  targetKg: number;
  weekStart: string; // ISO string for Monday
  createdAt: string;
  updatedAt: string;
}

export interface WeekInfo {
  weekStart: Date;   // Monday
  weekEnd: Date;     // Sunday
  dayOfWeek: number; // 1-7 (Mon-Sun)
  daysElapsed: number;
  daysRemaining: number;
  weekLabel: string; // e.g., "Sep 21 – Sep 27"
}

export interface WeeklyProgress {
  currentUsage: number;
  target: number;
  remaining: number;
  percentage: number;
  isExceeded: boolean;
  exceededBy: number;
}

export interface CategoryBreakdown {
  category: ActivityCategory;
  label: string;
  co2Kg: number;
  percentage: number;
  color: string;
}

export interface DailyBreakdown {
  day: string;        // e.g., "Mon"
  date: string;       // e.g., "Sep 21"
  co2Kg: number;
  isToday: boolean;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface NudgeInfo {
  show: boolean;
  exceededBy: number;
  suggestion: string;
  topCategory: ActivityCategory | null;
}
