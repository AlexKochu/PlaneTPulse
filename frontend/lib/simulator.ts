import { ActivityType } from './types';
import { calculateCO2 } from './calculations';
import { validateActivityInput } from './validation';

export interface SimulationResult {
  success: boolean;
  error?: string;
  warning?: string;
  currentCO2?: number;
  alternativeCO2?: number;
  diff?: number;
}

export function runSimulation(
  currentActivity: ActivityType | "",
  alternativeActivity: ActivityType | "",
  quantityRaw: string | number,
  confirmedUnusual: boolean = false
): SimulationResult {
  if (!currentActivity) return { success: false, error: "Choose an activity to simulate a scenario." };
  if (!alternativeActivity) return { success: false, error: "Choose an alternative to compare." };
  if (quantityRaw === "" || quantityRaw === null || quantityRaw === undefined) return { success: false, error: "Enter a quantity to calculate the scenario." };
  
  const qNum = typeof quantityRaw === 'string' ? parseFloat(quantityRaw) : quantityRaw;
  
  if (isNaN(qNum)) return { success: false, error: "Enter a valid number." };
  if (qNum === 0) return { success: false, error: "Quantity must be greater than zero." };
  if (qNum < 0) return { success: false, error: "Quantity cannot be negative." };

  try {
    const currVal = validateActivityInput(currentActivity, qNum);
    const altVal = validateActivityInput(alternativeActivity, qNum);
    
    if (!currVal.valid) return { success: false, error: currVal.error || "Invalid quantity." };
    if (!altVal.valid) return { success: false, error: altVal.error || "Invalid alternative quantity." };

    if (!confirmedUnusual && (currVal.requiresConfirmation || altVal.requiresConfirmation)) {
      return { 
        success: false, 
        warning: currVal.confirmationMessage || altVal.confirmationMessage || "Unusual value detected."
      };
    }
    
    const currentCO2 = calculateCO2(currentActivity, qNum).co2Kg;
    const alternativeCO2 = calculateCO2(alternativeActivity, qNum).co2Kg;
    // ensure precision
    const diff = Math.round((currentCO2 - alternativeCO2) * 100) / 100;

    return {
      success: true,
      currentCO2,
      alternativeCO2,
      diff
    };
  } catch (err) {
    return { success: false, error: "Unable to calculate this scenario. Please check your inputs and try again." };
  }
}
