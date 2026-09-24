from sqlalchemy import Column, Integer, String, Float, DateTime
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
