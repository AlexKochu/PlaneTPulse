from fastapi import APIRouter, Depends, HTTPException, Query
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
