import { API_BASE_URL } from "../apiConfig";
import { ActivityType } from "../types";

const API_URL = API_BASE_URL;


export async function createActivity(activityType: string, category: string, quantity: number, unit: string, date: string) {
  const res = await fetch(`${API_URL}/api/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activity_type: activityType, category, quantity, unit, date }),
  });
  if (!res.ok) throw new Error("Failed to create activity");
  return res.json();
}

export async function getActivities(activityType?: string, category?: string) {
  const params = new URLSearchParams();
  if (activityType && activityType !== "all") params.append("activity_type", activityType);
  if (category) params.append("category", category);
  
  const res = await fetch(`${API_URL}/api/activities?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to get activities");
  return res.json();
}

export async function getDashboardData() {
  const res = await fetch(`${API_URL}/api/dashboard`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to get dashboard data");
  return res.json();
}

export async function getCurrentTarget() {
  const res = await fetch(`${API_URL}/api/targets/current`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to get target");
  return res.json();
}

export async function updateTarget(weekly_target_kg: number) {
  const res = await fetch(`${API_URL}/api/targets/current`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weekly_target_kg }),
  });
  if (!res.ok) throw new Error("Failed to update target");
  return res.json();
}

export async function runSimulation(current_activity_type: string, current_quantity: number, alternative_activity_type: string, alternative_quantity: number) {
  const res = await fetch(`${API_URL}/api/simulator`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      current_activity_type,
      current_quantity,
      alternative_activity_type,
      alternative_quantity
    })
  });
  if (!res.ok) throw new Error("Simulation failed");
  return res.json();
}
