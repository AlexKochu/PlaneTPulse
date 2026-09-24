"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ArrowRight, Zap, TrendingDown, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Reveal, HoverLift } from "@/components/Motion";
import { getCurrentWeekActivities, getCurrentWeekTotal, getWeeklyTarget } from "@/lib/storage";

export default function WeeklyCoach() {
  const [loading, setLoading] = useState(false);
  const [coachData, setCoachData] = useState<any>(null);
  const router = useRouter();

  const handleAskCoach = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      // 1. Gather deterministic verified summary from current week
      const weekActivities = getCurrentWeekActivities();
      const totalCO2 = getCurrentWeekTotal();
      const targetObj = getWeeklyTarget();
      const weeklyTarget = targetObj?.targetKg || 0;
      
      let status = "no_target";
      if (weeklyTarget > 0) {
        status = totalCO2 > weeklyTarget ? "exceeded" : "on_track";
      }

      // Group activities to find biggest source
      const totalsByType: Record<string, { co2: number; qty: number; category: string }> = {};
      for (const act of weekActivities) {
        if (!totalsByType[act.activityType]) {
          totalsByType[act.activityType] = { co2: 0, qty: 0, category: act.category };
        }
        totalsByType[act.activityType].co2 += act.co2Kg;
        totalsByType[act.activityType].qty += act.quantity;
      }

      let biggestSource: string | null = null;
      let biggestSourceCO2 = 0;
      let biggestCategory = "";
      for (const [type, data] of Object.entries(totalsByType)) {
        if (data.co2 > biggestSourceCO2) {
          biggestSource = type;
          biggestSourceCO2 = data.co2;
          biggestCategory = data.category;
        }
      }

      // Build verified payload
      const payload: any = {
        user_prompt: "How am I doing this week?",
      };

      if (weekActivities.length > 0 || weeklyTarget > 0) {
        payload.verified_data = {
          total_co2: Math.round(totalCO2 * 100) / 100,
          weekly_target: weeklyTarget,
          status: status,
          biggest_source: biggestSource,
          biggest_source_co2: Math.round(biggestSourceCO2 * 100) / 100,
          biggest_category: biggestCategory,
        };
      }

      const res = await fetch(`${API_URL}/api/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Fallback to GET if POST isn't supported
        const getRes = await fetch(`${API_URL}/api/coach`);
        if (!getRes.ok) throw new Error("Failed to fetch coach data");
        const data = await getRes.json();
        setCoachData(data);
      } else {
        const data = await res.json();
        setCoachData(data);
      }
    } catch (err) {
      console.error("Coach fetch error:", err);
      // Client-side fallback if backend is unreachable
      const totalCO2 = getCurrentWeekTotal();
      const targetObj = getWeeklyTarget();
      const weeklyTarget = targetObj?.targetKg || 0;
      const status = weeklyTarget === 0 ? "no_target" : totalCO2 > weeklyTarget ? "exceeded" : "on_track";
      
      setCoachData({
        total_co2: totalCO2,
        weekly_target: weeklyTarget,
        status: status,
        biggest_source: null,
        biggest_source_co2: null,
        swap_scenario: null,
        coach_message: totalCO2 === 0
          ? "You haven't logged any activities this week yet! Log an activity on your dashboard to see your personalized coaching analysis."
          : `You've recorded ${totalCO2} kg CO₂ this week. ${weeklyTarget > 0 ? `Your weekly target is ${weeklyTarget} kg (${status === 'on_track' ? 'on track!' : 'exceeded'}).` : 'Set a weekly target to monitor your reduction goals!'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const exploreScenario = () => {
    if (!coachData?.swap_scenario) return;
    router.push("/what-if");
  };

  return (
    <Reveal direction="up" delay={0.2}>
      <div id="coach" className="glass-panel" style={{ padding: "1.75rem", marginBottom: "2rem", position: "relative", overflow: "hidden", borderRadius: "16px" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, background: "var(--color-primary-green)", filter: "blur(90px)", opacity: 0.18, borderRadius: "50%" }} />
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MessageSquare size={20} color="var(--color-primary-green)" />
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-primary-green)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              AI Carbon Coach
            </h3>
          </div>
          {coachData && (
            <button
              onClick={handleAskCoach}
              disabled={loading}
              className="btn btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <RefreshCw size={13} className={loading ? "spin-animate" : ""} /> Refresh Insight
            </button>
          )}
        </div>
        
        <h2 style={{ fontSize: "1.75rem", fontWeight: 600, fontFamily: "var(--font-serif)", marginBottom: "1.25rem", color: "var(--color-text)" }}>
          How am I doing this week?
        </h2>

        {!coachData && (
          <HoverLift>
            <button 
              onClick={handleAskCoach}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: "0.85rem 1.75rem", fontSize: "1rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", borderRadius: "999px" }}
            >
              {loading ? "Analyzing your week with Groq AI..." : "Ask Coach"} <ArrowRight size={18} />
            </button>
          </HoverLift>
        )}

        <AnimatePresence>
          {coachData && (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", padding: "1.5rem", borderRadius: "14px", border: "1px solid var(--glass-border)" }}
            >
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                <div style={{ background: "var(--color-soft-green)", padding: "0.75rem", borderRadius: "50%", flexShrink: 0, marginTop: "2px" }}>
                  <Zap size={22} color="var(--color-primary-green)" />
                </div>
                <div>
                  <p style={{ fontSize: "1.05rem", lineHeight: 1.6, color: "var(--color-text)", fontWeight: 500, margin: 0, whiteSpace: "pre-line" }}>
                    {coachData.coach_message}
                  </p>
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginTop: "1.25rem", marginBottom: "1.25rem" }}>
                <div style={{ padding: "1rem", background: "var(--color-white)", borderRadius: "10px", border: "1px solid var(--color-border-light)" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "0 0 0.25rem 0", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Weekly Footprint</p>
                  <p style={{ fontSize: "1.35rem", fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
                    {coachData.total_co2} <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontWeight: 400 }}>kg CO₂</span>
                  </p>
                </div>
                <div style={{ padding: "1rem", background: "var(--color-white)", borderRadius: "10px", border: "1px solid var(--color-border-light)" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "0 0 0.25rem 0", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Status</p>
                  <p style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: coachData.status === 'exceeded' ? 'var(--color-danger)' : coachData.status === 'on_track' ? 'var(--color-primary-green)' : 'var(--color-text-muted)' }}>
                    {coachData.status === 'on_track' ? '✓ On Track' : coachData.status === 'exceeded' ? '⚠ Exceeded Target' : 'No Target Set'}
                  </p>
                </div>
                {coachData.biggest_source && (
                  <div style={{ padding: "1rem", background: "var(--color-white)", borderRadius: "10px", border: "1px solid var(--color-border-light)" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "0 0 0.25rem 0", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Top Source</p>
                    <p style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, textTransform: "capitalize", color: "var(--color-text)" }}>
                      {coachData.biggest_source.replace('_', ' ')}
                    </p>
                  </div>
                )}
              </div>

              {coachData.swap_scenario && (
                <div style={{ background: "var(--color-white)", padding: "1.25rem", borderRadius: "10px", border: "1px solid rgba(46, 125, 79, 0.3)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-primary-green)", margin: "0 0 0.25rem 0", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, display: "flex", alignItems: "center", gap: "5px" }}>
                      <TrendingDown size={15} /> Verified Saving Recommendation
                    </p>
                    <p style={{ fontSize: "1.05rem", fontWeight: 600, margin: 0, color: "var(--color-text)" }}>
                      Save {Math.abs(coachData.swap_scenario.difference_kg)} kg CO₂ by swapping to {coachData.swap_scenario.alternative.activity_type.replace('_', ' ')}
                    </p>
                  </div>
                  <HoverLift>
                    <button onClick={exploreScenario} className="btn" style={{ background: "var(--color-soft-green)", color: "var(--color-primary-green)", padding: "0.6rem 1.2rem", fontSize: "0.9rem", fontWeight: 600, borderRadius: "999px", border: "1px solid rgba(46, 125, 79, 0.2)" }}>
                      Explore in Simulator →
                    </button>
                  </HoverLift>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}
