EMISSION_FACTORS = {
    "car": {"factor": 0.20, "unit": "km", "category": "transportation"},
    "bus": {"factor": 0.08, "unit": "km", "category": "transportation"},
    "flight": {"factor": 0.25, "unit": "km", "category": "transportation"},
    "electricity": {"factor": 0.40, "unit": "kWh", "category": "electricity"},
    "veg_meal": {"factor": 0.50, "unit": "meals", "category": "food"},
    "non_veg_meal": {"factor": 2.00, "unit": "meals", "category": "food"},
}

def get_emission_config(activity_type: str):
    return EMISSION_FACTORS.get(activity_type)

def calculate_carbon(activity_type: str, quantity: float) -> float:
    config = get_emission_config(activity_type)
    if not config:
        raise ValueError(f"Unknown activity type: {activity_type}")
    
    return round(quantity * config["factor"], 2)
