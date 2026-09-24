`from fastapi import FastAPI
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
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
