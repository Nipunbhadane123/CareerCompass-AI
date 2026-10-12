from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.job import SavedJob
from app.models.learning import LearningRoadmap
from app.core.deps import get_current_active_user
from app.services.career_service import get_career_recommendations
from app.schemas.resume import ResumeAnalysisResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard Intelligence"])

@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    profile = current_user.profile
    completeness = profile.completeness_score if profile else 20
    target_role = profile.target_role if profile and profile.target_role else "Software Engineer"
    skills = profile.skills if profile and profile.skills else []

    # Latest Resume
    latest_resume = None
    latest_analysis = None
    if current_user.resumes:
        res = current_user.resumes[0]
        latest_resume = {
            "id": res.id,
            "filename": res.filename,
            "uploaded_at": res.uploaded_at
        }
        if res.analyses:
            latest_analysis = ResumeAnalysisResponse.model_validate(res.analyses[0]).model_dump()

    # Top Career Recommendations
    recs = get_career_recommendations(db, current_user, limit=3)
    career_recs = [r.model_dump() for r in recs]

    # Active Roadmap
    active_roadmap = None
    roadmaps = db.query(LearningRoadmap).filter(LearningRoadmap.user_id == current_user.id).order_by(LearningRoadmap.updated_at.desc()).all()
    if roadmaps:
        rm = roadmaps[0]
        next_step = None
        for step in rm.steps:
            if not step.is_completed:
                next_step = {
                    "id": step.id,
                    "title": step.title,
                    "phase": step.phase,
                    "skill_name": step.skill_name,
                    "estimated_hours": step.estimated_hours
                }
                break

        active_roadmap = {
            "id": rm.id,
            "title": rm.title,
            "target_role": rm.target_role,
            "progress_percentage": rm.progress_percentage,
            "total_steps": len(rm.steps),
            "completed_steps": sum(1 for s in rm.steps if s.is_completed),
            "next_step": next_step
        }

    # Saved jobs count by status
    saved_jobs = db.query(SavedJob).filter(SavedJob.user_id == current_user.id).all()
    job_stats = {
        "total": len(saved_jobs),
        "saved": sum(1 for j in saved_jobs if j.status == "saved"),
        "applied": sum(1 for j in saved_jobs if j.status == "applied"),
        "interviewing": sum(1 for j in saved_jobs if j.status == "interviewing"),
        "offered": sum(1 for j in saved_jobs if j.status == "offered")
    }

    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "headline": profile.headline if profile else None,
            "target_role": target_role,
            "completeness_score": completeness,
            "skills": skills
        },
        "resume": {
            "latest_file": latest_resume,
            "analysis": latest_analysis
        },
        "career_recommendations": career_recs,
        "active_roadmap": active_roadmap,
        "job_tracker": job_stats
    }
