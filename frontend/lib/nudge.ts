// ============================================================
// PlanetPulse — Nudge Logic (DP1 Implementation)
// ============================================================
// Non-blocking warning + constructive encouragement when
// the weekly target is exceeded.
// ============================================================

import { NudgeInfo, ActivityRecord, ActivityCategory } from './types';
import { CATEGORY_CONFIG } from './calculations';

/**
 * Suggestions for reducing emissions by category.
 */
const CATEGORY_SUGGESTIONS: Record<ActivityCategory, string[]> = {
  transportation: [
    'Consider replacing car trips with bus travel — buses emit 60% less CO₂ per km.',
    'Could any of your short car trips be walked or cycled instead?',
    'Carpooling for your next trip could cut your transportation emissions in half.',
    'A single bus trip instead of a car trip saves about 0.12 kg CO₂ per km.',
  ],
  electricity: [
    'Switching off appliances on standby could lower your electricity footprint.',
    'Using natural light during the day can help reduce your electricity consumption.',
    'Consider setting your AC a degree or two higher to save energy.',
  ],
  food: [
    'Replacing one non-veg meal with a veg meal saves approximately 1.50 kg CO₂.',
    'Plant-based meals typically produce 75% less CO₂ than non-veg meals.',
    'A meatless day per week could meaningfully reduce your food emissions.',
  ],
};

/**
 * Get the category with the highest CO₂ from current week activities.
 */
function getTopCategory(activities: ActivityRecord[]): ActivityCategory | null {
  const totals: Record<ActivityCategory, number> = {
    transportation: 0,
    electricity: 0,
    food: 0,
  };

  for (const a of activities) {
    totals[a.category] += a.co2Kg;
  }

  let maxCat: ActivityCategory | null = null;
  let maxVal = 0;
  for (const [cat, val] of Object.entries(totals)) {
    if (val > maxVal) {
      maxVal = val;
      maxCat = cat as ActivityCategory;
    }
  }

  return maxCat;
}

/**
 * Generate nudge information when the weekly target is exceeded.
 */
export function generateNudge(
  currentUsage: number,
  target: number,
  weekActivities: ActivityRecord[]
): NudgeInfo {
  if (target <= 0 || currentUsage <= target) {
    return { show: false, exceededBy: 0, suggestion: '', topCategory: null };
  }

  const exceededBy = Math.round((currentUsage - target) * 100) / 100;
  const topCategory = getTopCategory(weekActivities);

  let suggestion = 'Consider reviewing your recent activities for areas to reduce emissions.';

  if (topCategory) {
    const suggestions = CATEGORY_SUGGESTIONS[topCategory];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    const categoryLabel = CATEGORY_CONFIG[topCategory].label;
    suggestion = `${categoryLabel} is currently your largest contributor. ${randomSuggestion}`;
  }

  return {
    show: true,
    exceededBy,
    suggestion,
    topCategory,
  };
}
