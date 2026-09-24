// ============================================================
// PlanetPulse — Input Validation (DP2 Implementation)
// ============================================================
// Two-level validation:
// 1. Reject invalid/impossible values (negative, zero, non-numeric, absurd)
// 2. Confirm unusual but plausible values
// ============================================================

import { ActivityType, ValidationResult } from './types';
import { ACTIVITY_CONFIGS } from './calculations';
import { getLocalDateString } from './week';

/**
 * Validate activity date:
 * - Must not be empty
 * - Must not be in the future
 */
export function validateActivityDate(dateRaw?: string): ValidationResult {
  if (!dateRaw || dateRaw.trim() === '') {
    return { valid: false, error: 'Please select an activity date.' };
  }

  const todayStr = getLocalDateString();
  if (dateRaw > todayStr) {
    return { valid: false, error: 'Activity date cannot be in the future.' };
  }

  return { valid: true };
}

/**
 * Validate activity input according to DP2 rules.
 *
 * @param activityType - The selected activity type
 * @param quantityRaw - The raw input value (may be string from form)
 * @param dateRaw - Optional activity date (YYYY-MM-DD)
 * @returns ValidationResult with valid/error/confirmation details
 */
export function validateActivityInput(
  activityType: ActivityType | '',
  quantityRaw: string | number,
  dateRaw?: string
): ValidationResult {
  // Check activity date if provided
  if (dateRaw !== undefined) {
    const dateVal = validateActivityDate(dateRaw);
    if (!dateVal.valid) {
      return dateVal;
    }
  }

  // Check activity type is selected
  if (!activityType) {
    return { valid: false, error: 'Please select an activity type.' };
  }

  // Check activity type is valid
  const config = ACTIVITY_CONFIGS[activityType as ActivityType];
  if (!config) {
    return { valid: false, error: 'Invalid activity type selected.' };
  }

  // Convert to number
  const quantity = typeof quantityRaw === 'string' ? parseFloat(quantityRaw) : quantityRaw;

  // Check for empty/non-numeric input
  if (quantityRaw === '' || quantityRaw === undefined || quantityRaw === null) {
    return { valid: false, error: 'Please enter a quantity.' };
  }

  if (isNaN(quantity)) {
    return { valid: false, error: 'Quantity must be a valid number.' };
  }

  if (!isFinite(quantity)) {
    return { valid: false, error: 'Quantity must be a finite number.' };
  }

  // Check for zero or negative
  if (quantity <= 0) {
    return { valid: false, error: 'Quantity must be greater than zero.' };
  }

  // Check absurd upper bounds (REJECT)
  if (quantity > config.maxReject) {
    return {
      valid: false,
      error: `${config.displayName}: ${quantity.toLocaleString()} ${config.unit} is not a valid value. Maximum allowed is ${config.maxReject.toLocaleString()} ${config.unit}.`,
    };
  }

  // Check unusual upper bounds (CONFIRM)
  if (quantity > config.maxWarn) {
    return {
      valid: true,
      requiresConfirmation: true,
      confirmationMessage: `This value is unusually high. Please confirm that you intended to enter ${quantity.toLocaleString()} ${config.unit} for ${config.displayName}.`,
    };
  }

  // All checks passed
  return { valid: true };
}
