from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.activity import Activity
from app.models.target import Target
from sqlalchemy import func

def get_dashboard_data(db: Session):
    total_footprint = db.query(func.sum(Activity.carbon_kg)).scalar() or 0.0
    
    # Calculate weekly footprint (simple logic for now, last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_footprint = db.query(func.sum(Activity.carbon_kg)).filter(Activity.created_at >= week_ago).scalar() or 0.0
    
    target = db.query(Target).order_by(Target.id.desc()).first()
    weekly_target = target.weekly_target_kg if target else 50.0
    
    target_used_percent = (weekly_footprint / weekly_target * 100) if weekly_target > 0 else 0
    remaining = max(0, weekly_target - weekly_footprint)
    
    # Category distribution
    distribution = {}
    cats = db.query(Activity.category, func.sum(Activity.carbon_kg)).group_by(Activity.category).all()
    for cat, val in cats:
        distribution[cat] = val
        
    activity_count = db.query(func.count(Activity.id)).scalar() or 0
    
    return {
        "total_footprint": round(total_footprint, 2),
        "weekly_footprint": round(weekly_footprint, 2),
        "weekly_target": weekly_target,
        "target_used_percent": round(target_used_percent, 2),
        "remaining": round(remaining, 2),
        "days_left": 7 - datetime.utcnow().weekday(),
        "category_distribution": distribution,
        "activity_count": activity_count
    }
