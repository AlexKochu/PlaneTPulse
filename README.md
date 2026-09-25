**Hackathon ID:** AZIS-CKACFN
# 🌍 PlanetPulse

**Code2Career AI Hackathon — Track 2 — Climate Tech**

> Turn daily choices into visible carbon impact. Log, track, coach, and simulate — all in one place.



[![Next.js](...)](...)
[![FastAPI](...)](...)
[![TypeScript](...)](...)
[![Python](...)](...)

---

## 🌐 Live Demo

**Frontend:** https://plane-t-pulse.vercel.app

**Backend API:** https://planetpulse-zwju.onrender.com

**Swagger / OpenAPI:** https://planetpulse-zwju.onrender.com/docs

**Authentication:** No login required.

Open the frontend and start using the application immediately.

---

## 📌 Project Overview

PlanetPulse is a full-stack climate-tech carbon footprint tracker that
turns everyday activities into a visible and measurable CO₂ footprint.

Users can:

- Log carbon-producing activities
- See deterministic CO₂ calculations
- Track their weekly footprint
- Set and monitor a weekly target
- View and filter activity history
- Delete logged activities
- Receive AI-powered carbon reduction guidance
- Run hypothetical "What-If" simulations

The application uses the exact emission factors specified in the
Code2Career Track 2 challenge.

---

## 🎯 Required Features

### 1. Log an Activity

Supports six activity types:

- Car
- Bus
- Flight
- Electricity
- Veg Meal
- Non-Veg Meal

Features:

- Dynamic units: km, kWh, meals
- Live CO₂ preview
- Input validation
- DP2 unusual/absurd input handling

### 2. CO₂ Calculation

CO₂ is calculated deterministically:

CO₂ (kg) = quantity × emission factor

| Activity | Factor | Unit |
|----------|--------|------|
| Car | 0.20 | kg CO₂/km |
| Bus | 0.08 | kg CO₂/km |
| Flight | 0.25 | kg CO₂/km |
| Electricity | 0.80 | kg CO₂/kWh |
| Veg Meal | 0.50 | kg CO₂/meal |
| Non-Veg Meal | 2.00 | kg CO₂/meal |

No external carbon dataset or carbon API is required.

### 3. Dashboard

The dashboard provides:

- Weekly and all-time footprint
- Category breakdown
- Weekly trend
- Weekly target progress
- Days elapsed / remaining
- Pacing insight
- Recent activities
- Target-exceeded nudge

### 4. Weekly Target

Users can:

- Set a weekly CO₂ target
- View current usage
- View remaining target
- View percentage used
- Monitor pacing
- Change the target during the current week

### 5. History & Filters

Users can:

- View logged activities
- Filter by activity type
- Filter by date
- Clear filters
- Delete individual activities

---

## 🧭 Decision Points

### DP1 — The Nudge

**Decision:** Non-blocking amber warning with a constructive,
data-driven suggestion.

When the weekly target is exceeded:

- Dashboard displays an amber warning
- Exact overage is displayed
- A reduction suggestion is shown
- User is never blocked from logging
- AI Coach can provide additional guidance

See `DECISIONS.md` for the complete rationale.

### DP2 — Absurd Input

PlanetPulse uses two-level validation:

| Level | Behavior |
|-------|----------|
| Accept | Normal values are submitted |
| Confirm | Unusually high values require confirmation |
| Reject | Invalid/absurd values are blocked |

Validation is activity-specific.

User input is never silently modified.

See `DECISIONS.md` for the exact thresholds.

### DP3 — The Week

PlanetPulse uses:

**Monday → Sunday (ISO 8601)**

The weekly dashboard displays:

- Days elapsed
- Days remaining
- Weekly progress
- Daily Mon–Sun trend
- Current weekly target

Target changes during the current week take effect immediately.

---

## 🤖 Bonus Features

### AI Coach

PlanetPulse includes a conversational AI Coach powered by Groq.

The Coach is grounded in verified application telemetry such as:

- Weekly CO₂
- Weekly target
- Target status
- Category contribution
- Other verified activity data

### AI Architecture

PlanetPulse does **not** use RAG.

The Coach uses **direct context injection / prompt grounding**.

Flow:

User question
↓
Verified PlanetPulse telemetry
↓
Context injected into prompt
↓
Groq LLM
↓
AI Coach response

There are no:

- Vector embeddings
- Document chunking
- Semantic retrieval
- Vector databases
- Pinecone / Chroma / FAISS

The deterministic application data remains the source of truth.

### What-If Simulator

Users can simulate hypothetical activity swaps.

Example:

Car → Bus

The simulator returns:

- Original CO₂
- Replacement CO₂
- CO₂ savings
- Savings percentage

Simulations do not modify real activity data.

---

## 🎥 Demo / Evaluation Flow

The following flow demonstrates the main application requirements.

### 1. Open the Application

Open:

https://plane-t-pulse.vercel.app

No login is required.

### 2. Log an Activity

- Open Log Activity
- Select Car
- Enter 10 km
- Verify:

10 × 0.20 = 2.00 kg CO₂

- Submit the activity

### 3. Verify Dashboard

Check that the activity appears in:

- Total footprint
- Category breakdown
- Weekly trend
- Recent activities

### 4. Set Weekly Target

Set a weekly CO₂ target.

Verify that the dashboard displays:

- Current usage
- Target
- Percentage used
- Remaining amount
- Pacing information

### 5. Test DP1

Log enough activity to exceed the weekly target.

Verify:

- Target-exceeded state appears
- Exact overage is shown
- Constructive suggestion appears
- Logging remains available

### 6. Test DP2

Attempt an absurd value such as:

500,000 km car trip

Verify that the application rejects the value according to the validation rules.

### 7. Test History

Verify:

- Activities appear
- Activity-type filtering works
- Date filtering works
- Activities can be deleted

### 8. Test AI Coach

Ask a question such as:

"Am I on track?"

Verify that the response is grounded in the current week's data.

### 9. Test What-If

Run a hypothetical swap such as:

30 km Car → 30 km Bus

Verify the calculated CO₂ difference.

---

## 🏗️ Architecture

```text
planetpulse/
│
├── frontend/                 # Next.js application
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── calculations.ts
│   │   ├── validation.ts
│   │   ├── week.ts
│   │   ├── nudge.ts
│   │   ├── simulator.ts
│   │   └── api/
│   └── __tests__/
│
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/routes/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── core/
│   ├── tests/
│   ├── requirements.txt
│   └── render.yaml
│
├── DECISIONS.md
└── README.md