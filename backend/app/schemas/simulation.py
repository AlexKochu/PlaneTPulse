from pydantic import BaseModel

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
