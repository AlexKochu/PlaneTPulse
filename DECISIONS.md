# DECISIONS.md — PlanetPulse

## Standard API

**Yes — the Standard REST API is fully implemented.**

PlanetPulse includes a complete FastAPI backend that exposes a standard JSON REST API.
Features are graded **by script** (direct API calls), not by a browser agent driving the UI.

### API Base URL

| Environment | URL |
|---|---|
| Frontend (Vercel) | `https://plane-t-pulse.vercel.app` |
| Backend (Render) | `https://planetpulse-backend.onrender.com` |
| Local development | `http://localhost:8000` |
| Swagger / OpenAPI docs | `https://planetpulse-backend.onrender.com/docs` |

### All Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check — returns `{"status":"ok"}` |
| `POST` | `/api/activities` | Log a new carbon activity |
| `GET` | `/api/activities` | Retrieve all logged activities |
| `DELETE` | `/api/activities/{id}` | Delete a specific activity |
| `GET` | `/api/dashboard` | Full dashboard summary (totals, breakdown, trend) |
| `GET` | `/api/targets/current` | Get the current weekly CO₂ target |
| `PUT` | `/api/targets/current` | Set or update the weekly CO₂ target |
| `POST` | `/api/simulator` | Run a what-if swap simulation |
| `GET` | `/api/coach` | Get AI coaching summary based on the week's data |
| `POST` | `/api/coach` | Ask the AI coach a custom question with chat history |

### Example — Log an Activity

```http
POST /api/activities
Content-Type: application/json

{
  "activity_type": "car",
  "quantity": 50
}
```

**Response:**
```json
{
  "id": 1,
  "activity_type": "car",
  "category": "Transport",
  "quantity": 50.0,
  "unit": "km",
  "carbon_kg": 10.0,
  "created_at": "2026-09-24T16:30:00Z"
}
```

### Example — Dashboard

```http
GET /api/dashboard
```

**Response:**
```json
{
  "total_co2_week": 17.5,
  "total_co2_alltime": 42.3,
  "weekly_target": 70.0,
  "target_status": "on_track",
  "category_breakdown": {
    "Transport": 12.0,
    "Food": 4.5,
    "Energy": 1.0
  },
  "daily_trend": [...],
  "recent_activities": [...]
}
```

### Emission Factors (exact hackathon spec values)

| Activity | Factor | Unit |
|---|---|---|
| `car` | 0.20 | kg CO2 / km |
| `bus` | 0.08 | kg CO2 / km |
| `flight` | 0.25 | kg CO2 / km |
| `electricity` | 0.80 | kg CO2 / kWh |
| `veg_meal` | 0.50 | kg CO2 / meal |
| `non_veg_meal` | 2.00 | kg CO2 / meal |

**Formula:** `CO2 (kg) = quantity x emission_factor` — deterministic, no ML, no invented values.

---

## Decision Point 1 — The Nudge

**Question:** What does the app do when the weekly target is crossed: warn, encourage, shame, or block?

**Decision: Non-blocking amber warning with a specific, constructive swap suggestion.**

### What we chose

When the user's logged activities for the current week exceed their set weekly CO2 target, PlanetPulse displays a prominent amber/orange banner at the top of the Dashboard. The banner states the exact overage (e.g., "Weekly target exceeded by 4.2 kg CO2") and provides a specific, data-driven suggestion tailored to the user's highest-contributing category — for example: "Your biggest source is car travel. Swapping one trip to bus could save ~2.4 kg CO2."

The user is **never blocked** from logging further activities. All features — logging, history, dashboard, AI coach, what-if simulator — remain fully accessible regardless of whether the target is exceeded.

The AI Coach (bonus feature) additionally provides conversational encouragement: when asked "Am I on track?", it acknowledges the overage warmly and offers concrete reduction strategies without shame language.

### Why

Blocking activity logging after a target is exceeded would be counterproductive to the core goal of PlanetPulse: honest awareness of one's footprint. A user who feels punished for truthful input would either stop logging or underreport — both outcomes corrupt the data and defeat the app's purpose entirely. Research in behavioral psychology (Self-Determination Theory, Fogg Behavior Model) consistently shows that constructive, specific feedback paired with a clear next action is far more effective at driving sustained behavior change than shame or restriction. By pinpointing the highest-contributing category and offering a concrete swap, we give users a path forward rather than vague guilt. The amber color signals urgency without aggression; the tone is supportive, not punitive.

---

## Decision Point 2 — Absurd Input

**Question:** How does the app treat an obviously wrong entry, such as a 500,000 km car trip?

**Decision: Two-level validation — hard reject for physically impossible values, confirmation prompt for unusual-but-plausible values. User input is never silently modified.**

### What we chose

PlanetPulse applies **per-activity-type thresholds** across two levels:

| Level | Condition | App Behaviour |
|---|---|---|
| **Accept** | Value within the normal range for that activity | Submitted immediately, no friction |
| **Confirm** | Above the warning threshold but below the hard maximum | A confirmation dialog appears explaining why the value is unusually high; the user must explicitly click Confirm or Cancel |
| **Reject** | Negative, zero, non-numeric, NaN, Infinity, or above the absolute maximum | Error message shown inline on the form; submission is blocked |

**Thresholds:**

| Activity | Unit | Warn Above | Hard Reject Above | Reasoning |
|---|---|---|---|---|
| Car | km | 1,000 | 50,000 | Earth circumference ~40,075 km — driving more in a single trip is physically impossible |
| Bus | km | 1,000 | 50,000 | Same reasoning as car |
| Flight | km | 15,000 | 50,000 | Longest commercial flights are ~18,000 km |
| Electricity | kWh | 500 | 100,000 | Average US household uses ~900 kWh/month; >500 kWh in one entry warrants a check |
| Veg Meal | meals | 20 | 100 | More than 20 meals in a single log entry is highly unusual |
| Non-Veg Meal | meals | 20 | 100 | Same reasoning as veg meal |

On the frontend, the Log Activity page shows a real-time preview card that updates as the user types — so they see the CO2 impact of their input before submitting, which naturally catches typos without needing a modal. The backend (`POST /api/activities`) also performs its own server-side validation and returns a `422 Unprocessable Entity` with a clear error message for any value that violates the spec.

### Why

A single global maximum would be simultaneously too strict (a 14,000 km flight is perfectly valid) and too permissive (100 meals in one entry is nonsensical). Per-activity thresholds respect the real-world envelope of each activity type. The two-level approach — warning vs. hard reject — preserves user autonomy: if someone genuinely drove 1,200 km on a road trip, they should be able to log it after confirming, not be blocked by an arbitrary cap. We never silently clamp or round the user's value because silent modification is dishonest — the user would see a CO2 number that doesn't match what they entered, which erodes trust in the tool entirely.

---

## Decision Point 3 — The Week

**Question:** When does a "week" start, and how is mid-week progress displayed?

**Decision: Monday through Sunday ISO week, anchored to the user's local timezone. Mid-week pacing is shown explicitly with days elapsed, days remaining, and a proportional progress indicator.**

### What we chose

PlanetPulse defines a week as **Monday 00:00:00 through Sunday 23:59:59** in the user's local timezone, following the ISO 8601 standard. The current week boundary is computed server-side in UTC and displayed on the frontend with an explicit date range (e.g., "Week: Sep 21 to Sep 27").

The Dashboard shows:
- **Weekly CO2 used** — sum of all activities logged this Mon–Sun
- **Weekly target** — the user's set limit in kg CO2
- **Progress bar** — fills proportionally; turns amber above 80%, red above 100%
- **Days elapsed / Days remaining** — e.g., "Day 4 of 7"
- **Pacing insight** — e.g., "You've used 60% of your target in 4 of 7 days — you're ahead of pace"
- **Weekly trend chart** — a bar per day (Mon–Sun), today highlighted, so users can see which days drove the most emissions

If a user changes their weekly target mid-week, the new target takes effect **immediately** on the current week's data. There is no grace period and no retroactive re-weighting of historical weeks. This is the simplest, most transparent behavior: the user sees the effect of their decision instantly, and no past data is altered.

The AI Coach also uses the current week's verified data when answering questions, so coaching responses are always grounded in the same Monday–Sunday window.

### Why

Monday–Sunday is the ISO 8601 week standard and is the most widely used convention in professional, academic, and personal contexts globally. Using the user's local timezone ensures that a late-night activity logged at 11:45 PM in IST is counted on the correct calendar day for that user — not silently rolled into the next day in a different timezone. Showing days elapsed and remaining alongside the raw percentage gives far more actionable pacing information: a user who has consumed 80% of their budget on Day 2 needs to take immediate action, while the same 80% on Day 6 means they are almost fine. Applying target changes immediately is the most honest and transparent choice — any deferral would mean the displayed progress bar does not reflect the user's actual intent, which is confusing and undermines trust.

---

## Summary

| Point | Decision | Principle |
|---|---|---|
| **DP1 — Nudge** | Non-blocking amber warning + specific swap suggestion | Constructive, not punitive |
| **DP2 — Absurd Input** | Per-activity two-level validation (warn / hard reject); never silent | Honest, user-respecting |
| **DP3 — The Week** | Monday–Sunday ISO week, local timezone, immediate target changes | Transparent, accurate |
| **Standard API** | Yes — Full REST API implemented — graded by script | FastAPI + JSON |
