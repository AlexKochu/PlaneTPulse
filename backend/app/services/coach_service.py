import os
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.activity import Activity
from app.models.target import Target
from app.services.simulation_service import simulate
from app.core.config import settings
from sqlalchemy import func
from typing import Optional, Dict, Any
from groq import Groq

GROQ_API_KEY = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")

SWAP_MAP = {
    "car": ("bus", 1.0),
    "car_commute": ("bus", 1.0),
    "non_veg_meal": ("veg_meal", 1.0),
    "flight_domestic": ("train", 1.0),
    "flight_long": ("flight_domestic", 0.5),
}

def get_swap_for_activity(activity_type: str, qty: float):
    if not activity_type or qty <= 0:
        return None
    if activity_type in SWAP_MAP:
        alt, factor = SWAP_MAP[activity_type]
        try:
            return simulate(activity_type, qty, alt, qty * factor)
        except Exception:
            return None
    return None

def call_groq_llm(prompt: str, chat_history: Optional[list] = None) -> Optional[str]:
    try:
        client = Groq(api_key=GROQ_API_KEY)
        messages = [
            {
                "role": "system",
                "content": (
                    "You are PlanetPulse's Weekly Carbon Coach. Your goal is to supportively analyze the user's verified weekly carbon footprint and answer their questions. "
                    "CRITICAL: Never calculate, invent, extrapolate, or alter any CO2 values or statistics. Use strictly the numbers given in the prompt. "
                    "Keep your response warm, motivating, and concise."
                )
            }
        ]
        if chat_history:
            messages.extend(chat_history)
        messages.append({"role": "user", "content": prompt})

        completion = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=messages,
            temperature=0.7,
            max_tokens=512
        )
        return completion.choices[0].message.content
    except Exception as e:
        print("Groq API error:", str(e))
        return None

def get_weekly_coach_summary(db: Optional[Session] = None, verified_data: Optional[Dict[str, Any]] = None, user_prompt: str = "How am I doing this week?", chat_history: Optional[list] = None):
    if verified_data:
        weekly_footprint = float(verified_data.get("total_co2", verified_data.get("totalCO2", 0.0)))
        weekly_target = float(verified_data.get("weekly_target", verified_data.get("weeklyTarget", 0.0)))
        status = verified_data.get("status", verified_data.get("targetStatus", "no_target"))
        biggest_type = verified_data.get("biggest_source", verified_data.get("biggestSource"))
        biggest_co2 = float(verified_data.get("biggest_source_co2", verified_data.get("biggestSourceCO2", 0.0)))
        biggest_category = verified_data.get("biggest_category", "Transport" if biggest_type in ["car", "bus", "train", "flight_domestic"] else "Food")
        swap_suggestion = verified_data.get("swap_scenario")
        if not swap_suggestion and biggest_type:
            swap_suggestion = get_swap_for_activity(biggest_type, 10.0)
    elif db:
        week_ago = datetime.utcnow() - timedelta(days=7)
        weekly_footprint = db.query(func.sum(Activity.carbon_kg)).filter(Activity.created_at >= week_ago).scalar() or 0.0
        
        target = db.query(Target).order_by(Target.id.desc()).first()
        weekly_target = target.weekly_target_kg if target else 0.0
        
        if weekly_target == 0:
            status = "no_target"
        elif weekly_footprint > weekly_target:
            status = "exceeded"
        else:
            status = "on_track"

        biggest_activity = db.query(
            Activity.activity_type, 
            Activity.category,
            func.sum(Activity.carbon_kg).label('total_carbon'),
            func.sum(Activity.quantity).label('total_qty')
        ).filter(Activity.created_at >= week_ago)\
         .group_by(Activity.activity_type, Activity.category)\
         .order_by(func.sum(Activity.carbon_kg).desc()).first()

        if not biggest_activity:
            return {
                "total_co2": 0.0,
                "weekly_target": weekly_target,
                "status": "no_data",
                "biggest_source": None,
                "biggest_source_co2": None,
                "swap_scenario": None,
                "coach_message": "You haven't logged any activities this week! Log an activity on your dashboard to receive personalized coaching insights."
            }
            
        biggest_type, biggest_category, biggest_co2, biggest_qty = biggest_activity
        swap_suggestion = get_swap_for_activity(biggest_type, biggest_qty)
    else:
        return {
            "total_co2": 0.0,
            "weekly_target": 0.0,
            "status": "no_data",
            "biggest_source": None,
            "biggest_source_co2": None,
            "swap_scenario": None,
            "coach_message": "No activity data available. Log an activity to get coaching."
        }

    # Build prompt for LLM
    prompt = (
        f"User Prompt: {user_prompt}\n\n"
        f"Verified Data:\n"
        f"- Weekly Footprint: {round(weekly_footprint, 2)} kg CO2\n"
        f"- Weekly Target: {weekly_target} kg CO2\n"
        f"- Status: {'on track' if status == 'on_track' else 'exceeded target' if status == 'exceeded' else 'no target set'}\n"
    )
    if biggest_type:
        prompt += f"- Biggest Emission Source: {biggest_category} ({biggest_type.replace('_', ' ')}) generating {round(biggest_co2, 2)} kg CO2\n"
    if swap_suggestion:
        diff = abs(round(swap_suggestion['difference_kg'], 2))
        alt_type = swap_suggestion['alternative']['activity_type'].replace('_', ' ')
        orig_type = biggest_type.replace('_', ' ') if biggest_type else "current activity"
        prompt += f"- Actionable Swap: Swapping {orig_type} with {alt_type} saves {diff} kg CO2.\n"

    llm_message = call_groq_llm(prompt, chat_history)

    if not llm_message:
        # High quality fallback message
        llm_message = f"You're currently at {round(weekly_footprint, 2)} kg CO₂ for the week against your {weekly_target} kg target, meaning you are {'on track' if status == 'on_track' else 'exceeding your target' if status == 'exceeded' else 'actively logging'}. {biggest_category or 'Activity'} ({biggest_type.replace('_', ' ') if biggest_type else ''}) is your primary contributor."
        if swap_suggestion:
            diff = abs(round(swap_suggestion['difference_kg'], 2))
            alt_type = swap_suggestion['alternative']['activity_type'].replace('_', ' ')
            llm_message += f" Consider switching to {alt_type}, which can cut your impact by {diff} kg CO₂."

    return {
        "total_co2": round(weekly_footprint, 2),
        "weekly_target": weekly_target,
        "status": status,
        "biggest_source": biggest_type,
        "biggest_source_co2": round(biggest_co2, 2) if biggest_co2 else None,
        "swap_scenario": swap_suggestion,
        "coach_message": llm_message
    }
