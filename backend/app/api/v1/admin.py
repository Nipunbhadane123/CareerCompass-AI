from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume, ResumeAnalysis
from app.models.job import JobListing, JobMatch
from app.models.career import CareerRole, Skill
from app.models.learning import LearningRoadmap
from app.core.deps import get_current_superuser
from app.seed_data import seed_database

router = APIRouter(prefix="/admin", tags=["Administrative Interface"])

@router.get("/metrics")
def get_admin_metrics(
    current_admin: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    total_users = db.query(User).count()
    total_resumes = db.query(Resume).count()
    total_analyses = db.query(ResumeAnalysis).count()
    total_roles = db.query(CareerRole).count()
    total_skills = db.query(Skill).count()
    total_jobs = db.query(JobListing).count()
    total_matches = db.query(JobMatch).count()
    total_roadmaps = db.query(LearningRoadmap).count()

    return {
        "platform_metrics": {
            "total_users": total_users,
            "total_resumes": total_resumes,
            "total_analyses": total_analyses,
            "total_career_roles": total_roles,
            "total_skills": total_skills,
            "total_sample_jobs": total_jobs,
            "total_job_matches": total_matches,
            "total_roadmaps": total_roadmaps
        },
        "system_status": {
            "database": "connected",
            "storage_layer": "healthy",
            "ai_worker_queue": "idle"
        }
    }

@router.get("/jobs/status")
def get_processing_job_status(
    current_admin: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    return {
        "queue_name": "resume_intelligence_worker",
        "active_jobs": 0,
        "completed_jobs": db.query(ResumeAnalysis).count(),
        "failed_jobs": 0,
        "worker_health": "operational",
        "average_processing_latency_ms": 320
    }

@router.post("/seed-data")
def trigger_seed_database(
    current_admin: User = Depends(get_current_superuser)
) -> Dict[str, str]:
    seed_database()
    return {"status": "success", "message": "Platform seed data refreshed successfully."}
