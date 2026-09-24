import os
import textwrap

backend_dir = 'backend'
dirs = [
    'app',
    'app/core',
    'app/models',
    'app/schemas',
    'app/api',
    'app/api/routes',
    'app/services',
    'tests'
]

for d in dirs:
    os.makedirs(os.path.join(backend_dir, d), exist_ok=True)

files = {}

files['requirements.txt'] = """fastapi
uvicorn
sqlalchemy
pydantic
pydantic-settings
python-dotenv
pytest
httpx
"""

files['.env.example'] = """DATABASE_URL=sqlite:///./planetpulse.db
FRONTEND_URL=http://localhost:3000
"""

files['.gitignore'] = """.env
*.db
__pycache__
.pytest_cache
.venv
"""

files['app/__init__.py'] = ""

files['app/main.py'] = """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import activities, dashboard, targets, simulator
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

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "PlanetPulse API"}
"""

files['app/core/__init__.py'] = ""

files['app/core/config.py'] = """from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./planetpulse.db"
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
"""

files['app/core/database.py'] = """from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"""

files['app/models/__init__.py'] = ""

files['app/models/activity.py'] = """from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String, index=True)
    category = Column(String)
    quantity = Column(Float)
    unit = Column(String)
    carbon_kg = Column(Float)
    date = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
"""

files['app/models/target.py'] = """from sqlalchemy import Column, Integer, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Target(Base):
    __tablename__ = "targets"
    id = Column(Integer, primary_key=True, index=True)
    weekly_target_kg = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
"""

files['app/schemas/__init__.py'] = ""

files['app/schemas/activity.py'] = """from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ActivityBase(BaseModel):
    activity_type: str
    category: str
    quantity: float
    unit: str
    date: str

class ActivityCreate(ActivityBase):
    pass

class ActivityResponse(ActivityBase):
    id: int
    carbon_kg: float
    created_at: datetime

    class Config:
        from_attributes = True
"""

files['app/schemas/target.py'] = """from pydantic import BaseModel, Field

class TargetUpdate(BaseModel):
    weekly_target_kg: float = Field(..., gt=0)

class TargetResponse(TargetUpdate):
    id: int

    class Config:
        from_attributes = True
"""

files['app/schemas/dashboard.py'] = """from pydantic import BaseModel
from typing import Dict, Any

class DashboardResponse(BaseModel):
    total_footprint: float
    weekly_footprint: float
    weekly_target: float
    target_used_percent: float
    remaining: float
    days_left: int
    category_distribution: Dict[str, float]
    activity_count: int
"""

files['app/schemas/simulation.py'] = """from pydantic import BaseModel

class SimulationRequest(BaseModel):
    current_activity_type: str
    current_quantity: float
    alternative_activity_type: str
    alternative_quantity: float

class SimulationActivity(BaseModel):
    activity_type: str
    quantity: float
    carbon_kg: float

class SimulationResponse(BaseModel):
    current: SimulationActivity
    alternative: SimulationActivity
    difference_kg: float
    percentage_change: float
    impact: str
"""

files['app/services/__init__.py'] = ""

files['app/services/carbon_calculator.py'] = """
EMISSION_FACTORS = {
    "car": {"factor": 0.20, "unit": "km", "category": "transportation"},
    "bus": {"factor": 0.08, "unit": "km", "category": "transportation"},
    "flight": {"factor": 0.25, "unit": "km", "category": "transportation"},
    "electricity": {"factor": 0.40, "unit": "kWh", "category": "electricity"},
    "veg_meal": {"factor": 0.50, "unit": "meals", "category": "food"},
    "non_veg_meal": {"factor": 2.00, "unit": "meals", "category": "food"},
}

def get_emission_config(activity_type: str):
    return EMISSION_FACTORS.get(activity_type)

def calculate_carbon(activity_type: str, quantity: float) -> float:
    config = get_emission_config(activity_type)
    if not config:
        raise ValueError(f"Unknown activity type: {activity_type}")
    
    return round(quantity * config["factor"], 2)
"""

files['app/services/simulation_service.py'] = """from app.services.carbon_calculator import calculate_carbon

def simulate(current_type: str, current_qty: float, alt_type: str, alt_qty: float):
    current_carbon = calculate_carbon(current_type, current_qty)
    alt_carbon = calculate_carbon(alt_type, alt_qty)
    
    diff = round(alt_carbon - current_carbon, 2)
    pct = round((diff / current_carbon * 100) if current_carbon > 0 else 0, 2)
    impact = "reduction" if diff < 0 else "increase"
    
    return {
        "current": {"activity_type": current_type, "quantity": current_qty, "carbon_kg": current_carbon},
        "alternative": {"activity_type": alt_type, "quantity": alt_qty, "carbon_kg": alt_carbon},
        "difference_kg": diff,
        "percentage_change": pct,
        "impact": impact
    }
"""

files['app/api/__init__.py'] = ""
files['app/api/routes/__init__.py'] = ""

files['app/api/routes/activities.py'] = """from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.core.database import get_db
from app.models.activity import Activity
from app.schemas.activity import ActivityCreate, ActivityResponse
from app.services.carbon_calculator import calculate_carbon

router = APIRouter()

@router.post("", response_model=ActivityResponse)
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    if activity.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")
    
    try:
        carbon = calculate_carbon(activity.activity_type, activity.quantity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    db_activity = Activity(
        **activity.dict(),
        carbon_kg=carbon
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.get("", response_model=List[ActivityResponse])
def get_activities(
    activity_type: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Activity)
    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)
    if category:
        query = query.filter(Activity.category == category)
        
    return query.order_by(desc(Activity.created_at)).all()

@router.delete("/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    db.delete(db_activity)
    db.commit()
    return {"ok": True}
"""

files['app/api/routes/targets.py'] = """from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.target import Target
from app.schemas.target import TargetUpdate, TargetResponse

router = APIRouter()

@router.get("/current", response_model=TargetResponse)
def get_current_target(db: Session = Depends(get_db)):
    target = db.query(Target).order_by(Target.id.desc()).first()
    if not target:
        target = Target(weekly_target_kg=50.0)
        db.add(target)
        db.commit()
        db.refresh(target)
    return target

@router.put("/current", response_model=TargetResponse)
def update_target(target_in: TargetUpdate, db: Session = Depends(get_db)):
    target = db.query(Target).order_by(Target.id.desc()).first()
    if target:
        target.weekly_target_kg = target_in.weekly_target_kg
    else:
        target = Target(weekly_target_kg=target_in.weekly_target_kg)
        db.add(target)
    
    db.commit()
    db.refresh(target)
    return target
"""

files['app/services/dashboard_service.py'] = """from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.activity import Activity
from app.models.target import Target
from sqlalchemy import func

def get_dashboard_data(db: Session):
    total_footprint = db.query(func.sum(Activity.carbon_kg)).scalar() or 0.0
    
    # Calculate weekly footprint (simple logic for now, last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_footprint = db.query(func.sum(Activity.carbon_kg)).filter(Activity.created_at >= week_ago).scalar() or 0.0
    
    target = db.query(Target).order_by(Target.id.desc()).first()
    weekly_target = target.weekly_target_kg if target else 50.0
    
    target_used_percent = (weekly_footprint / weekly_target * 100) if weekly_target > 0 else 0
    remaining = max(0, weekly_target - weekly_footprint)
    
    # Category distribution
    distribution = {}
    cats = db.query(Activity.category, func.sum(Activity.carbon_kg)).group_by(Activity.category).all()
    for cat, val in cats:
        distribution[cat] = val
        
    activity_count = db.query(func.count(Activity.id)).scalar() or 0
    
    return {
        "total_footprint": round(total_footprint, 2),
        "weekly_footprint": round(weekly_footprint, 2),
        "weekly_target": weekly_target,
        "target_used_percent": round(target_used_percent, 2),
        "remaining": round(remaining, 2),
        "days_left": 7 - datetime.utcnow().weekday(),
        "category_distribution": distribution,
        "activity_count": activity_count
    }
"""

files['app/api/routes/dashboard.py'] = """from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import get_dashboard_data

router = APIRouter()

@router.get("", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    return get_dashboard_data(db)
"""

files['app/api/routes/simulator.py'] = """from fastapi import APIRouter, HTTPException
from app.schemas.simulation import SimulationRequest, SimulationResponse
from app.services.simulation_service import simulate

router = APIRouter()

@router.post("", response_model=SimulationResponse)
def run_simulation(req: SimulationRequest):
    try:
        return simulate(req.current_activity_type, req.current_quantity, req.alternative_activity_type, req.alternative_quantity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
"""

for path, content in files.items():
    with open(os.path.join(backend_dir, path), 'w') as f:
        f.write(content.strip() + '\n')
