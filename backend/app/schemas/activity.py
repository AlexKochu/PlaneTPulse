from pydantic import BaseModel
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
