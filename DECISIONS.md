# Decision Points

## DP1 — The Nudge

**Question:** What does the app do when the weekly target is crossed: warn, encourage, shame, block?

**Decision:** Non-blocking warning + constructive encouragement.

**Implementation:**

When the weekly target is exceeded, PlanetPulse displays a prominent amber banner at the top of the dashboard. The banner clearly states how much the user exceeded their target by (e.g., "⚠️ Weekly target exceeded by 4.2 kg CO₂") and provides a constructive, specific suggestion based on their highest-contributing category.

The user is never blocked from logging additional activities. All features remain fully accessible.

**Reasoning:**

PlanetPulse is designed to increase awareness and encourage behavior change, not to punish users. Blocking activity logging after exceeding a target would discourage honest tracking — users who feel punished would stop recording activities, defeating the core purpose of understanding one's carbon footprint. Research in behavioral psychology consistently shows that constructive feedback and self-awareness are more effective at driving long-term behavior change than shame or punishment. By identifying the user's top-contributing category and suggesting specific actionable alternatives (e.g., "Replacing two car trips with bus travel could reduce your estimated footprint"), we give users a clear path to improvement rather than vague guilt.

---

## DP2 — Absurd Input

**Question:** How do you treat an obviously wrong entry such as 500,000 km car trip?

**Decision:** Two-level validation — reject impossible values, require confirmation for unusual values.

**Implementation:**

| Level | Condition | Action |
|-------|-----------|--------|
| **Reject** | Negative, zero, non-numeric, NaN, Infinity, or above absolute maximum | Show clear error message; prevent submission |
| **Confirm** | Above warning threshold but below absolute maximum | Show confirmation dialog explaining the value is unusually high; user must click [Confirm] or [Cancel] |
| **Accept** | Within normal range | Submit immediately |

**Activity-specific thresholds:**

| Activity | Unit | Warn Above | Reject Above | Reasoning |
|----------|------|-----------|--------------|-----------|
| Car | km | 1,000 | 50,000 | Earth circumference ~40,000 km |
| Bus | km | 1,000 | 50,000 | Same reasoning as car |
| Flight | km | 15,000 | 50,000 | Longest commercial flights ~18,000 km |
| Electricity | kWh | 500 | 100,000 | Avg US household ~900 kWh/month |
| Veg Meal | meals | 20 | 100 | >20 meals in a single entry is unusual |
| Non-Veg Meal | meals | 20 | 100 | Same reasoning as veg meal |

**Reasoning:**

A blanket maximum across all activities would be too restrictive for some (flights can genuinely be 10,000+ km) and too permissive for others (100 meals is absurd). Per-activity thresholds respect the real-world range of each activity type. The two-level approach — rejection vs. confirmation — prevents obviously impossible data from corrupting the user's footprint while still respecting the user's autonomy for values that are unusual but potentially real (e.g., a long road trip). We never silently modify the user's input; the user always sees why their value was flagged and makes the final decision.

---

## DP3 — The Week

**Question:** When does a "week" start, and how is mid-week progress shown?

**Decision:** A week runs Monday → Sunday, using the user's local time.

**Implementation:**

- The week period is displayed explicitly on the dashboard: "Week: Sep 21 – Sep 27"
- The dashboard shows: current CO₂ used, weekly target, percentage used, days elapsed, and days remaining
- The weekly trend chart shows emissions for each day (Mon–Sun) with today highlighted
- When a user changes their weekly target mid-week, the new target applies immediately to the current week's existing data. The progress bar and percentage recalculate instantly. This is the simplest, most transparent behavior — the user sees the impact of their target change right away.

**Reasoning:**

Monday–Sunday is the ISO 8601 standard for weeks and is the most common business/personal week convention globally. Using the user's local time (via JavaScript's `Date` object) ensures that activities are attributed to the correct day regardless of the user's timezone — a user logging a late-night activity in IST shouldn't see it counted on the wrong day. Showing days elapsed and remaining gives users a clear sense of pacing — "I've used 60% of my target but I'm only on day 3 of 7" provides much more actionable insight than a simple percentage alone.
