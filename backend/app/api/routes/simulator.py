from fastapi import APIRouter, HTTPException
from app.schemas.simulation import SimulationRequest, SimulationResponse
from app.services.simulation_service import simulate

router = APIRouter()

@router.post("", response_model=SimulationResponse)
def run_simulation(req: SimulationRequest):
    try:
        return simulate(req.current_activity_type, req.current_quantity, req.alternative_activity_type, req.alternative_quantity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
