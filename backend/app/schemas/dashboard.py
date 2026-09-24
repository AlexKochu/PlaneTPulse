from pydantic import BaseModel
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
