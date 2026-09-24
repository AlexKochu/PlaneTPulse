from fastapi import APIRouter, Depends, HTTPException
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
