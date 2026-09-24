# PlanetPulse 🌍


**Code2Career AI Hackathon — Track 2 — Climate Tech**

## Hackathon ID

> AZIS-CKACFN

---

## Project Overview

PlanetPulse is a carbon footprint tracker that turns daily choices into a visible carbon footprint. Users can log activities (car travel, bus travel, flights, electricity usage, and meals), see their estimated CO₂ emissions calculated with fixed emission factors, track progress against weekly targets, and review their history with filters.

**No authentication is required.** The app is immediately usable when opened — graders can access all features without creating an account.

---

## Features

### 1. Log an Activity
Record an activity with type and quantity. Supports six activity types: Car, Bus, Flight, Electricity, Veg Meal, and Non-Veg Meal. Dynamic units and live CO₂ preview.

### 2. CO₂ Calculation
Deterministic calculation using fixed emission factors from the hackathon brief:

| Activity | Factor | Unit |
|----------|--------|------|
| Car | 0.20 | kg CO₂/km |
| Bus | 0.08 | kg CO₂/km |
| Flight | 0.25 | kg CO₂/km |
| Electricity | 0.80 | kg CO₂/kWh |
| Veg Meal | 0.50 | kg CO₂/meal |
| Non-Veg Meal | 2.00 | kg CO₂/meal |

**Formula:** `CO₂ = quantity × emission factor`

### 3. Dashboard
Shows total carbon footprint (week/all-time toggle), per-category breakdown (donut chart), weekly trend (bar chart), and recent activities.

### 4. Weekly Target
Set a weekly CO₂ target, see current usage, remaining amount, percentage used, days elapsed/remaining, and a progress bar. Triggers a constructive nudge when exceeded.

### 5. History & Filter
View all logged activities with date/time, activity type, quantity, unit, and CO₂. Filter by activity type and date range (today, this week, custom dates). Clear filters button and empty state.

---

## Decision Points

### DP1 — The Nudge
**Decision:** Non-blocking warning + constructive encouragement.
When the weekly target is exceeded, a prominent amber banner warns the user and provides a specific suggestion based on their highest-contributing category. Users are never blocked from logging activities.

### DP2 — Absurd Input
**Decision:** Two-level validation — reject impossible values, confirm unusual values.
Activity-specific thresholds ensure that obviously absurd entries (500,000 km car trip) are rejected, while unusual but plausible values (2,000 km car trip) require explicit confirmation. User input is never silently modified.

### DP3 — The Week
**Decision:** Monday → Sunday, using the user's local time.
The week period is shown explicitly (e.g., "Week: Sep 21 – Sep 27"). The dashboard shows days elapsed, days remaining, and pacing information. Target changes during a week apply immediately.

See [DECISIONS.md](./DECISIONS.md) for full details.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS (custom properties design system) |
| Charts | Recharts |
| Data Storage | localStorage (browser) |
| Deployment | Vercel |
| Testing | Jest |

---

## Architecture

```
planetpulse/
├── app/
│   ├── layout.tsx            # Root layout + Google Fonts
│   ├── page.tsx              # Landing page
│   ├── globals.css           # Design system
│   └── app/
│       ├── layout.tsx        # App nav layout
│       ├── page.tsx          # Dashboard
│       ├── log/
│       │   └── page.tsx      # Log Activity
│       └── history/
│           └── page.tsx      # History & Filters
├── components/
│   ├── CategoryChart.tsx     # Donut chart
│   └── WeeklyTrendChart.tsx  # Bar chart
├── lib/
│   ├── types.ts              # TypeScript types
│   ├── calculations.ts       # CO₂ calculation engine
│   ├── validation.ts         # DP2 validation logic
│   ├── storage.ts            # localStorage data layer
│   ├── week.ts               # DP3 week utilities
│   └── nudge.ts              # DP1 nudge logic
├── __tests__/
│   └── calculations.test.ts  # Unit tests
├── DECISIONS.md              # Decision Points documentation
└── README.md                 # This file
```

**Design principles:**
- Calculation logic is centralized in `lib/calculations.ts` — not scattered across components
- Validation logic is separated in `lib/validation.ts`
- All types are defined in `lib/types.ts`
- Components are reusable and focused

---

## CO₂ Calculation

The calculation engine uses the **exact fixed emission factors** provided in the hackathon brief:

```
CO₂ (kg) = quantity × emission factor

Examples:
  10 km car     → 10 × 0.20 = 2.00 kg CO₂
  5 kWh elec    → 5  × 0.80 = 4.00 kg CO₂
  2 veg meals   → 2  × 0.50 = 1.00 kg CO₂
```

No external datasets. No ML models. No invented values. Deterministic calculation only.

---

## Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## Deployment

This app is designed for deployment on **Vercel**:

```bash
# Production build
npm run build

# Deploy to Vercel
npx vercel --prod
```

Or connect the GitHub repository to Vercel for automatic deployments.

---

## Testing

```bash
# Run unit tests
npx jest

# Tests cover:
# - All 6 activity types with correct emission factors
# - Decimal quantities
# - Invalid inputs (negative, zero, NaN, Infinity, absurd)
# - DP2 validation (reject/confirm/accept paths)
# - Emission factor verification against hackathon spec
```

---

## Standard API

The Standard API specification for Track 2 was not publicly available. Therefore, the Standard API was **not implemented**.

Instead, the UI is designed to be extremely browser-agent friendly:
- Semantic HTML
- Visible labels on all form fields
- `data-testid` attributes on all key elements
- Accessible forms with ARIA attributes
- Predictable navigation
- Clear success/error states
- Stable selectors

---

## No Authentication

**No authentication is intentionally implemented.** The hackathon explicitly prohibits login/signup functionality:

> "Do not implement authentication (login/signup) in your project: graders must be able to access all features without creating an account."

The app is immediately usable when the public URL is opened. Data is stored in the browser's localStorage.
