from pydantic import BaseModel, Field

class TargetUpdate(BaseModel):
    weekly_target_kg: float = Field(..., gt=0)

class TargetResponse(TargetUpdate):
    id: int

    class Config:
        from_attributes = True
