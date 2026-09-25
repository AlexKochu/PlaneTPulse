// ============================================================
// PlanetPulse — Resilient Coach Engine (Client & Server)
// Ensures coach works reliably on any device, network, or environment
// ============================================================

export interface CoachStats {
  total_co2: number;
  weekly_target: number;
  status: string;
  biggest_source?: string | null;
  biggest_source_co2?: number | null;
  swap_scenario?: any;
}

export interface CoachResponseData {
  total_co2: number;
  weekly_target: number;
  status: string;
  biggest_source: string | null;
  biggest_source_co2: number;
  swap_scenario: any;
  coach_message: string;
}

const SWAP_MAP: Record<string, [string, number, number, number]> = {
  car: ["bus", 1.0, 0.20, 0.08],
  non_veg_meal: ["veg_meal", 1.0, 2.00, 0.50],
  flight: ["train / bus", 1.0, 0.25, 0.08],
  electricity: ["energy saving habits", 1.0, 0.80, 0.40],
};

export function computeSwapSuggestion(source: string | null | undefined, qty: number = 10) {
  if (!source) return null;
  const match = SWAP_MAP[source];
  if (!match) return null;
  const [alt, ratio, origFactor, altFactor] = match;
  const origCo2 = qty * origFactor;
  const altCo2 = qty * ratio * altFactor;
  const diff = origCo2 - altCo2;
  return {
    original: { activity_type: source, quantity: qty, carbon_kg: Math.round(origCo2 * 100) / 100 },
    alternative: { activity_type: alt, quantity: qty * ratio, carbon_kg: Math.round(altCo2 * 100) / 100 },
    difference_kg: Math.round(diff * 100) / 100,
    savings_percent: Math.round((diff / origCo2) * 1000) / 10,
  };
}

export function generateSmartCoachMessage(params: {
  userPrompt: string;
  totalCO2: number;
  weeklyTarget: number;
  status: string;
  biggestSource: string | null;
  biggestSourceCO2: number;
  biggestCategory: string;
  swapSuggestion: any;
}): string {
  const { userPrompt, totalCO2, weeklyTarget, status, biggestSource, biggestSourceCO2, biggestCategory, swapSuggestion } = params;
  const q = userPrompt.toLowerCase();

  // If user has 0 activities logged
  if (totalCO2 === 0) {
    if (q.includes("target") || q.includes("goal")) {
      return weeklyTarget > 0
        ? `Your weekly budget is set to **${weeklyTarget} kg CO₂**. You haven't recorded any carbon emissions yet this week, so you have the entire budget remaining! Try logging a travel or meal activity to see your real-time pace.`
        : `You don't have a weekly target set yet! Setting a target (like 50 kg CO₂/week) is a great way to stay mindful. Head to your Dashboard or Settings to set one, and log your daily commute or meals to track progress.`;
    }
    if (q.includes("biggest") || q.includes("source") || q.includes("worst")) {
      return `You haven't logged any activities yet this week! Once you log trips, electricity, or meals, I'll calculate your highest emission source with verified formulas.`;
    }
    if (q.includes("swap") || q.includes("reduce") || q.includes("tip")) {
      return `Welcome to PlanetPulse! Here are 3 high-impact habits to start reducing emissions right away:\n\n1. **Transit Swaps**: Taking the bus or train instead of driving solo cuts transport emissions by up to 60%.\n2. **Plant-Forward Days**: Choosing vegetarian meals over beef or lamb saves ~1.5 kg CO₂ per meal.\n3. **Efficient Energy**: Turning off unused lights & vampire appliances can save hundreds of kWh annually.\n\nLog an activity on your dashboard to see customized swap simulations!`;
    }
    return `Hello! 🌍 Your weekly carbon footprint is currently **0.00 kg CO₂** with zero logged activities. As you go through your week, log your car trips, flights, electricity use, and meals on the Dashboard, and I'll give you instant, personalized guidance!`;
  }

  // User has logged activities
  const sourceName = biggestSource ? biggestSource.replace(/_/g, " ") : "general activities";
  const statusDescription = status === "on_track"
    ? `you are comfortably on track with ${Math.round((weeklyTarget - totalCO2) * 100) / 100} kg CO₂ remaining in your budget 🎉`
    : status === "exceeded"
    ? `you have exceeded your weekly target by ${Math.round((totalCO2 - weeklyTarget) * 100) / 100} kg CO₂ ⚠️`
    : `you are actively tracking without an active budget constraint`;

  if (q.includes("biggest") || q.includes("source") || q.includes("high") || q.includes("worst")) {
    if (biggestSource) {
      let advice = `Your biggest source of emissions this week is **${biggestCategory}: ${sourceName}**, contributing **${biggestSourceCO2.toFixed(2)} kg CO₂** out of your ${totalCO2.toFixed(2)} kg CO₂ total.`;
      if (swapSuggestion) {
        advice += `\n\n💡 **Actionable Swap**: Swapping ${sourceName} for **${swapSuggestion.alternative.activity_type}** could save around **${Math.abs(swapSuggestion.difference_kg).toFixed(2)} kg CO₂** (~${swapSuggestion.savings_percent}% reduction).`;
      }
      return advice;
    }
  }

  if (q.includes("swap") || q.includes("alternative") || q.includes("save")) {
    if (swapSuggestion) {
      return `Here's your top recommended swap:\n\n✨ **Swap ${sourceName} → ${swapSuggestion.alternative.activity_type}**\n- Expected CO₂ Savings: **${Math.abs(swapSuggestion.difference_kg).toFixed(2)} kg CO₂**\n- Efficiency Gain: **${swapSuggestion.savings_percent}% reduction**\n\nCheck out our What-If Simulator in the dashboard to test different weekly distances and habits!`;
    }
    return `To save the most emissions this week, consider replacing private car trips with public transit, or substituting 1–2 meat-based meals with plant-based alternatives. Both offer immediate 50–70% reductions for those activities!`;
  }

  if (q.includes("target") || q.includes("on track") || q.includes("budget") || q.includes("pace")) {
    if (weeklyTarget > 0) {
      const pct = Math.round((totalCO2 / weeklyTarget) * 100);
      return `You are currently at **${totalCO2.toFixed(2)} kg CO₂** of your **${weeklyTarget} kg CO₂** target (${pct}% used). Based on this, ${statusDescription}. Keep an eye on ${sourceName} to stay within your threshold!`;
    }
    return `You're currently at **${totalCO2.toFixed(2)} kg CO₂** this week. You haven't set a weekly budget yet! Setting a target on your dashboard will unlock real-time progress indicators.`;
  }

  // General check-in response
  let res = `You're currently at **${totalCO2.toFixed(2)} kg CO₂** this week${weeklyTarget > 0 ? ` against your **${weeklyTarget} kg CO₂** target` : ""}. In summary, ${statusDescription}.`;
  if (biggestSource) {
    res += ` Your primary emission driver is **${biggestCategory} (${sourceName})** at **${biggestSourceCO2.toFixed(2)} kg CO₂**.`;
  }
  if (swapSuggestion) {
    res += `\n\n🌱 **Quick win**: Consider swapping to **${swapSuggestion.alternative.activity_type}** to cut up to **${Math.abs(swapSuggestion.difference_kg).toFixed(2)} kg CO₂**!`;
  }
  return res;
}
