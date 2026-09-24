from app.services.carbon_calculator import calculate_carbon

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
