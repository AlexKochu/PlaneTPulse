## Hackathon ID = AZIS-CKACFN
---

# 🌍 PlanetPulse

### **Code2Career AI Hackathon — Track 2 — Climate Tech**

> _Turn daily choices into visible carbon impact. Log, track, coach, and simulate — all in one place._

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📑 Table of Contents

- [Live Demo](#-live-demo)
- [Project Overview](#-project-overview)
- [Features](#-features)
- [Bonus Features](#-bonus-features)
- [Decision Points](#-decision-points)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Standard API](#-standard-api)
- [CO₂ Calculation Engine](#-co-calculation-engine)
- [Running Locally](#-running-locally)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [No Authentication](#-no-authentication)

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| **Live**  | [`https://plane-t-pulse.vercel.app`](https://plane-t-pulse.vercel.app) |


> **No login required.** Open the URL and start using all features immediately.

---

## 🌱 Project Overview

PlanetPulse is a **full-stack carbon footprint tracker** that transforms everyday choices — commuting, flying, eating, using electricity — into a visible, quantifiable carbon footprint. Users can:

- **Log activities** across 6 categories (car, bus, flight, electricity, veg meal, non-veg meal)
- **See instant CO₂ calculations** using deterministic emission factors from the hackathon spec
- **Track progress** against a weekly target with pacing insights
- **Review history** with powerful date/type filters
- **Ask an AI Coach** for personalized reduction strategies *(bonus)*
- **Run "What-If" simulations** to see the impact of swapping habits *(bonus)*

The app is **immediately usable** — no account creation, no authentication. Graders can access **all features** by simply opening the deployed URL.

---

## ✅ Features

### 1. 📝 Log an Activity
- Select from **6 activity types**: Car, Bus, Flight, Electricity, Veg Meal, Non-Veg Meal
- Dynamic units update based on activity type (km, kWh, meals)
- **Live CO₂ preview card** updates as you type — catch typos before submitting
- Two-level validation: hard reject for absurd values, confirmation prompt for unusual ones (see [DP2](#dp2--absurd-input))

### 2. 📊 Dashboard
- **Total carbon footprint** with week / all-time toggle
- **Category breakdown** — interactive donut chart (Recharts)
- **Weekly trend** — bar chart showing daily emissions (Mon–Sun), today highlighted
- **Weekly target tracker** — progress bar, days elapsed/remaining, pacing insight
- **Recent activities** — quick glance at latest logs
- **Nudge banner** — constructive amber warning when target is exceeded (see [DP1](#dp1--the-nudge))

### 3. 🎯 Weekly Target
- Set a weekly CO₂ target in kg
- See current usage, remaining amount, and percentage used
- Progress bar turns **amber** above 80%, **red** above 100%
- Displays days elapsed/remaining and pacing status
- Target changes take effect **immediately** on the current week's data (see [DP3](#dp3--the-week))

### 4. 📜 History & Filters
- View **all logged activities** with date/time, type, quantity, unit, and CO₂
- Filter by **activity type** and **date range** (today, this week, custom dates)
- Clear filters button and empty state messaging
- Delete individual activities

---

## 🌟 Bonus Features

### 5. 🤖 AI Coach (Groq-powered)
- **Conversational AI assistant** for personalized carbon reduction guidance
- Asks: _"Am I on track?"_ — gets a grounded answer using your actual week's data
- Provides **specific, actionable swap suggestions** based on your highest-contributing category
- Full **chat history** maintained per session
- Powered by **Groq LLM API** with system prompts grounded in your real carbon data

### 6. 🔮 What-If Simulator
- Run **swap simulations**: _"What if I biked instead of driving?"_
- See the **exact CO₂ difference** before making a change
- Explore hypothetical scenarios without affecting real data
- Backend-computed simulations via `POST /api/simulator`

---

## 🧭 Decision Points

### DP1 — The Nudge

> **What does the app do when the weekly target is crossed?**

**Decision:** Non-blocking amber warning + specific, constructive swap suggestion.

- Prominent amber/orange banner at the top of the Dashboard
- States the exact overage (e.g., _"Exceeded by 4.2 kg CO₂"_)
- Provides a **data-driven suggestion** tailored to the highest-contributing category  
  (e.g., _"Your biggest source is car travel. Swapping one trip to bus could save ~2.4 kg CO₂."_)
- The user is **never blocked** from logging further activities
- AI Coach additionally offers warm, shame-free encouragement when asked

**Why:** Blocking would cause users to stop logging or underreport — defeating the app's purpose. Behavioral research (Self-Determination Theory, Fogg Behavior Model) shows constructive, specific feedback drives sustained change far more effectively than punishment.

### DP2 — Absurd Input

> **How does the app treat an obviously wrong entry (e.g., 500,000 km car trip)?**

**Decision:** Two-level validation — hard reject for impossible values, confirmation for unusual ones. User input is **never silently modified**.

| Level | Condition | Behavior |
|-------|-----------|----------|
| **Accept** | Within normal range | Submitted immediately |
| **Confirm** | Above warning threshold, below hard max | Confirmation dialog with explanation |
| **Reject** | Negative, zero, NaN, Infinity, or above absolute max | Inline error, submission blocked |

**Per-activity thresholds:**

| Activity | Warn Above | Hard Reject Above |
|----------|------------|-------------------|
| Car / Bus | 1,000 km | 50,000 km |
| Flight | 15,000 km | 50,000 km |
| Electricity | 500 kWh | 100,000 kWh |
| Veg / Non-Veg Meal | 20 meals | 100 meals |

**Why:** A single global cap would be too strict for flights and too permissive for meals. Per-activity thresholds respect real-world envelopes. Silent modification erodes trust.

### DP3 — The Week

> **When does a "week" start? How is mid-week progress displayed?**

**Decision:** Monday → Sunday (ISO 8601), user's local timezone. Mid-week pacing shown explicitly.

- Week boundary displayed as date range (e.g., _"Week: Sep 21 – Sep 27"_)
- Dashboard shows: days elapsed, days remaining, pacing insight
- Weekly trend chart: one bar per day (Mon–Sun), today highlighted
- Target changes mid-week apply **immediately** — most transparent behavior
- AI Coach uses the same Monday–Sunday window for grounded responses

**Why:** ISO 8601 Monday–Sunday is the global standard. Local timezone prevents late-night activities from landing on the wrong day. Immediate target changes are the most honest — no confusion about deferred effects.

> 📄 **See [DECISIONS.md](./DECISIONS.md) for the complete, in-depth write-up.**

---

## 🛠️ Tech Stack

### Frontend

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript 5** |
| Styling | **Vanilla CSS** (custom properties design system) |
| Charts | **Recharts 3** |
| Animations | **Framer Motion** |
| Icons | **Lucide React** |
| Deployment | **Vercel** |

### Backend

| Layer | Technology |
|-------|------------|
| Framework | **FastAPI** |
| Language | **Python 3.12** |
| ORM | **SQLAlchemy** |
| Validation | **Pydantic** |
| Database | **SQLite** (local) |
| AI | **Groq API** (LLM for AI Coach) |
| Deployment | **Render** |

### Testing

| Layer | Technology |
|-------|------------|
| Frontend | **Jest** + **ts-jest** |
| Backend | **Pytest** + **httpx** |

---

## 🏗️ Architecture

```
planetpulse/
├── frontend/                        # Next.js 16 App
│   ├── app/
│   │   ├── layout.tsx               # Root layout + Google Fonts
│   │   ├── page.tsx                 # Landing page (hero, scroll journey)
│   │   ├── globals.css              # Design system (custom properties)
│   │   ├── coach/
│   │   │   └── page.tsx             # AI Coach (standalone entry)
│   │   ├── what-if/
│   │   │   └── page.tsx             # What-If Simulator (standalone entry)
│   │   └── app/
│   │       ├── layout.tsx           # App navigation layout
│   │       ├── page.tsx             # Dashboard
│   │       ├── log/
│   │       │   └── page.tsx         # Log Activity
│   │       ├── history/
│   │       │   └── page.tsx         # History & Filters
│   │       └── coach/
│   │           └── page.tsx         # AI Coach (in-app)
│   ├── components/
│   │   ├── CategoryChart.tsx        # Donut chart (category breakdown)
│   │   ├── WeeklyTrendChart.tsx     # Bar chart (daily trend)
│   │   ├── ConversationalCoach.tsx  # AI chat interface
│   │   ├── WhatIfSimulator.tsx      # Swap simulation UI
│   │   ├── HeroHologramGlobe.tsx    # Landing page globe animation
│   │   ├── HeroLivingScene.tsx      # Landing page scene
│   │   ├── ScrollJourney.tsx        # Scroll-based feature reveal
│   │   ├── PlanetPulseLogo.tsx      # Animated logo
│   │   ├── AppNav.tsx               # App navigation bar
│   │   ├── LandingNav.tsx           # Landing page nav
│   │   ├── ThemeProvider.tsx        # Dark/light theme
│   │   ├── ThemeToggle.tsx          # Theme switcher
│   │   ├── Motion.tsx               # Motion utilities
│   │   └── ...                      # Additional UI components
│   ├── lib/
│   │   ├── types.ts                 # TypeScript interfaces & types
│   │   ├── calculations.ts          # CO₂ calculation engine
│   │   ├── validation.ts            # DP2 two-level validation
│   │   ├── storage.ts               # localStorage data layer
│   │   ├── week.ts                  # DP3 week utilities
│   │   ├── nudge.ts                 # DP1 nudge logic
│   │   ├── simulator.ts            # What-If simulation logic
│   │   └── api/                     # Backend API client
│   └── __tests__/
│       ├── calculations.test.ts     # CO₂ calculation tests
│       ├── target-and-dates.test.ts # Weekly target & date logic tests
│       └── what-if.test.ts          # What-If simulator tests
│
├── backend/                         # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry + CORS
│   │   ├── api/routes/
│   │   │   ├── activities.py        # CRUD for carbon activities
│   │   │   ├── dashboard.py         # Dashboard aggregation
│   │   │   ├── targets.py           # Weekly target get/set
│   │   │   ├── simulator.py         # What-If simulation endpoint
│   │   │   └── coach.py             # AI Coach endpoints
│   │   ├── models/                  # SQLAlchemy models
│   │   ├── schemas/                 # Pydantic schemas
│   │   ├── services/
│   │   │   ├── carbon_calculator.py # Emission factor engine
│   │   │   ├── dashboard_service.py # Dashboard data service
│   │   │   ├── simulation_service.py# Simulation engine
│   │   │   └── coach_service.py     # Groq AI integration
│   │   └── core/                    # Config & database setup
│   ├── tests/                       # Pytest test suite
│   ├── render.yaml                  # Render deployment config
│   ├── requirements.txt             # Python dependencies
│   └── .env.example                 # Environment variables template
│
├── DECISIONS.md                     # Decision Points (full write-up)
└── README.md                        # ← You are here
```

### Design Principles

- **Separation of concerns** — Calculation, validation, storage, nudge, and week logic are each isolated in dedicated modules under `lib/`
- **Full-stack with clear boundaries** — Frontend handles UI/UX; backend owns data persistence, API, and AI
- **Type safety** — All types centralized in `lib/types.ts`; Pydantic schemas on the backend
- **Reusable components** — Each React component is focused and composable
- **Deterministic calculations** — CO₂ logic uses exact hackathon spec factors, no ML, no guessing

---

## 📡 Standard API

**Yes — the Standard REST API is fully implemented.** PlanetPulse includes a FastAPI backend exposing a JSON REST API. Features are graded **by script** (direct API calls), not by a browser agent.

### Base URLs

| Environment | URL |
|-------------|-----|
| Production (Backend) | `https://planetpulse-zwju.onrender.com` |
| Production (Frontend) | `https://plane-t-pulse.vercel.app` |
| Local Development | `http://localhost:8000` |
| Swagger / OpenAPI Docs | `https://planetpulse-zwju.onrender.com/docs` |

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check — returns `{"status": "ok"}` |
| `POST` | `/api/activities` | Log a new carbon activity |
| `GET` | `/api/activities` | Retrieve all logged activities |
| `DELETE` | `/api/activities/{id}` | Delete a specific activity |
| `GET` | `/api/dashboard` | Full dashboard summary (totals, breakdown, trend) |
| `GET` | `/api/targets/current` | Get the current weekly CO₂ target |
| `PUT` | `/api/targets/current` | Set or update the weekly CO₂ target |
| `POST` | `/api/simulator` | Run a what-if swap simulation |
| `GET` | `/api/coach` | Get AI coaching summary for the week |
| `POST` | `/api/coach` | Ask the AI coach a custom question |

### Example — Log an Activity

```http
POST /api/activities
Content-Type: application/json

{
  "activity_type": "car",
  "quantity": 50
}
```

**Response** `201 Created`:
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

### Example — Get Dashboard

```http
GET /api/dashboard
```

**Response** `200 OK`:
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
  "daily_trend": ["..."],
  "recent_activities": ["..."]
}
```

### Example — What-If Simulation

```http
POST /api/simulator
Content-Type: application/json

{
  "original_activity": "car",
  "original_quantity": 30,
  "swap_activity": "bus",
  "swap_quantity": 30
}
```

**Response** `200 OK`:
```json
{
  "original_co2": 6.0,
  "swap_co2": 2.4,
  "savings_co2": 3.6,
  "savings_percent": 60.0
}
```

---

## 🔢 CO₂ Calculation Engine

The calculation engine uses the **exact fixed emission factors** provided in the hackathon brief:

| Activity | Factor | Unit |
|----------|--------|------|
| Car | 0.20 | kg CO₂ / km |
| Bus | 0.08 | kg CO₂ / km |
| Flight | 0.25 | kg CO₂ / km |
| Electricity | 0.80 | kg CO₂ / kWh |
| Veg Meal | 0.50 | kg CO₂ / meal |
| Non-Veg Meal | 2.00 | kg CO₂ / meal |

**Formula:**

```
CO₂ (kg) = quantity × emission factor
```

**Examples:**

| Input | Calculation | Result |
|-------|-------------|--------|
| 10 km by car | 10 × 0.20 | 2.00 kg CO₂ |
| 5 kWh electricity | 5 × 0.80 | 4.00 kg CO₂ |
| 2 veg meals | 2 × 0.50 | 1.00 kg CO₂ |

> **No external datasets. No ML models. No invented values.** Deterministic calculation only.

---

## 💻 Running Locally

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.12
- **npm** (comes with Node.js)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/planetpulse.git
cd planetpulse
```

### 2. Start the Backend

```bash
cd backend

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env to add your GROQ_API_KEY (required for AI Coach)

# Run the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

### 3. Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

#### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite connection string | Yes (default provided) |
| `FRONTEND_URL` | Frontend origin for CORS | Yes |
| `GROQ_API_KEY` | Groq API key for AI Coach | For AI Coach feature |

---

## 🧪 Testing

### Frontend Tests (Jest)

```bash
cd frontend
npx jest
```

**Test coverage includes:**
- All 6 activity types with correct emission factors
- Decimal and edge-case quantities
- Invalid inputs (negative, zero, NaN, Infinity, absurd values)
- DP2 validation paths (accept / confirm / reject)
- Emission factor verification against hackathon spec
- Weekly target and date logic
- What-If simulator calculations

### Backend Tests (Pytest)

```bash
cd backend
source .venv/bin/activate
pytest
```

---

## 🚢 Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
npx vercel --prod
```

Or connect the GitHub repository to Vercel for automatic deployments on every push.

### Backend → Render

1. Push to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Use the provided [`render.yaml`](./backend/render.yaml) for configuration
4. Set `GROQ_API_KEY` in the Render Dashboard environment variables

---

## 🔓 No Authentication

**No authentication is intentionally implemented.** Per the hackathon rules:

> _"Do not implement authentication (login/signup) in your project: graders must be able to access all features without creating an account."_

The app is **immediately usable** when the public URL is opened. Data is stored in SQLite (backend) and localStorage (frontend fallback).

---

## 📄 Summary

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Log an Activity | ✅ Done | 6 activity types, dynamic units, live CO₂ preview |
| CO₂ Calculation | ✅ Done | Exact hackathon emission factors, deterministic |
| Dashboard | ✅ Done | Totals, donut chart, trend chart, pacing |
| Weekly Target | ✅ Done | Progress bar, nudge, immediate updates |
| History & Filter | ✅ Done | Type + date filters, delete, empty states |
| Standard API | ✅ Done | Full FastAPI REST API with 10 endpoints |
| Decision Points | ✅ Done | DP1 (nudge), DP2 (validation), DP3 (week) |
| AI Coach *(bonus)* | ✅ Done | Groq-powered conversational assistant |
| What-If Simulator *(bonus)* | ✅ Done | Swap simulation with CO₂ savings |
| No Authentication | ✅ Compliant | Zero login — fully open |

---

<p align="center">
  Built with 💚 for a greener planet
</p>