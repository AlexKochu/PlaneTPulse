// ============================================================
// PlanetPulse — CO₂ Calculation Engine
// ============================================================
// This module contains all emission factors and calculation logic.
// All values come from the hackathon brief and are FIXED.
// CO₂ = quantity × emission factor (deterministic)
// ============================================================

import { Car, Bus, Plane, Zap, Salad, Drumstick } from 'lucide-react';
import React from 'react';
import { ActivityType, ActivityConfig, ActivityCategory } from './types';

/**
 * FIXED emission factors from the hackathon brief.
 * DO NOT modify these values.
 */
export const ACTIVITY_CONFIGS: Record<ActivityType, ActivityConfig> = {
  car: {
    key: 'car',
    displayName: 'Car',
    unit: 'km',
    category: 'transportation',
    emissionFactor: 0.20,
    icon: React.createElement(Car, { size: 24 }),
    maxReject: 50000,
    maxWarn: 1000,
  },
  bus: {
    key: 'bus',
    displayName: 'Bus',
    unit: 'km',
    category: 'transportation',
    emissionFactor: 0.08,
    icon: React.createElement(Bus, { size: 24 }),
    maxReject: 50000,
    maxWarn: 1000,
  },
  flight: {
    key: 'flight',
    displayName: 'Flight',
    unit: 'km',
    category: 'transportation',
    emissionFactor: 0.25,
    icon: React.createElement(Plane, { size: 24 }),
    maxReject: 50000,
    maxWarn: 15000,
  },
  electricity: {
    key: 'electricity',
    displayName: 'Electricity',
    unit: 'kWh',
    category: 'electricity',
    emissionFactor: 0.80,
    icon: React.createElement(Zap, { size: 24 }),
    maxReject: 100000,
    maxWarn: 500,
  },
  veg_meal: {
    key: 'veg_meal',
    displayName: 'Veg Meal',
    unit: 'meals',
    category: 'food',
    emissionFactor: 0.50,
    icon: React.createElement(Salad, { size: 24 }),
    maxReject: 100,
    maxWarn: 20,
  },
  non_veg_meal: {
    key: 'non_veg_meal',
    displayName: 'Non-Veg Meal',
    unit: 'meals',
    category: 'food',
    emissionFactor: 2.00,
    icon: React.createElement(Drumstick, { size: 24 }),
    maxReject: 100,
    maxWarn: 20,
  },
};

/**
 * All activity types as an ordered array.
 */
export const ACTIVITY_TYPES: ActivityType[] = [
  'car', 'bus', 'flight', 'electricity', 'veg_meal', 'non_veg_meal'
];

/**
 * Category display configuration.
 */
export const CATEGORY_CONFIG: Record<ActivityCategory, { label: string; color: string }> = {
  transportation: { label: 'Transportation', color: '#3b82f6' },
  electricity: { label: 'Electricity', color: '#f59e0b' },
  food: { label: 'Food', color: '#10b981' },
};

/**
 * Calculate CO₂ for a given activity and quantity.
 * The calculation is deterministic: CO₂ = quantity × emission factor.
 *
 * @param activityType - The type of activity
 * @param quantity - The quantity (km, kWh, meals, etc.)
 * @returns Object with factor, quantity, unit, and CO₂ result
 */
export function calculateCO2(activityType: ActivityType, quantity: number): {
  factor: number;
  quantity: number;
  unit: string;
  co2Kg: number;
} {
  const config = ACTIVITY_CONFIGS[activityType];
  if (!config) {
    throw new Error(`Unknown activity type: ${activityType}`);
  }

  const co2Kg = Math.round(quantity * config.emissionFactor * 100) / 100;

  return {
    factor: config.emissionFactor,
    quantity,
    unit: config.unit,
    co2Kg,
  };
}

/**
 * Get the activity config for a given type.
 */
export function getActivityConfig(activityType: ActivityType): ActivityConfig {
  const config = ACTIVITY_CONFIGS[activityType];
  if (!config) {
    throw new Error(`Unknown activity type: ${activityType}`);
  }
  return config;
}

/**
 * Format CO₂ value for display.
 */
export function formatCO2(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} t`;
  }
  return `${kg.toFixed(2)} kg`;
}
