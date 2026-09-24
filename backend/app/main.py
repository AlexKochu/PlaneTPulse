from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import activities, dashboard, targets, simulator, coach
from app.core.config import settings
from app.core.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PlanetPulse API",
    description="Carbon footprint tracking backend",
    version="1.0.0"
)

# Parse comma-separated origins from FRONTEND_URL env var
# e.g. "https://planetpulse.vercel.app,https://planetpulse-git-main.vercel.app"
_raw_origins = settings.FRONTEND_URL or "http://localhost:3000"
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # allow all Vercel preview URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(activities.router, prefix="/api/activities", tags=["Activities"])
app.include_router(targets.router, prefix="/api/targets", tags=["Targets"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(simulator.router, prefix="/api/simulator", tags=["Simulator"])
app.include_router(coach.router, prefix="/api/coach", tags=["Coach"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "PlanetPulse API"}
