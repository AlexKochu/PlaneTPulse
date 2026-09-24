from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.coach_service import get_weekly_coach_summary
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter()

class CoachRequest(BaseModel):
    verified_data: Optional[Dict[str, Any]] = None
    user_prompt: Optional[str] = "How am I doing this week?"
    chat_history: Optional[list] = None

class CoachResponse(BaseModel):
    total_co2: float
    weekly_target: float
    status: str
    biggest_source: Optional[str] = None
    biggest_source_co2: Optional[float] = None
    swap_scenario: Optional[Dict[str, Any]] = None
    coach_message: str

@router.get("", response_model=CoachResponse)
def get_coach_insight(db: Session = Depends(get_db)):
    return get_weekly_coach_summary(db=db)

@router.post("", response_model=CoachResponse)
def post_coach_insight(payload: Optional[CoachRequest] = None, db: Session = Depends(get_db)):
    verified_data = payload.verified_data if payload else None
    user_prompt = payload.user_prompt if payload and payload.user_prompt else "How am I doing this week?"
    chat_history = payload.chat_history if payload and payload.chat_history else None
    return get_weekly_coach_summary(db=db, verified_data=verified_data, user_prompt=user_prompt, chat_history=chat_history)
