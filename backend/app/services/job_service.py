from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.job import JobListing, JobMatch, SavedJob
from app.models.user import User
from app.ai import get_ai_provider
from app.schemas.job import (
    JobListingResponse, JobMatchResponse, SavedJobResponse,
    CustomJobMatchRequest, SaveJobRequest
)

def get_job_listings(
    db: Session,
    search: Optional[str] = None,
    domain: Optional[str] = None,
    job_type: Optional[str] = None
) -> List[JobListingResponse]:
    query = db.query(JobListing)
    if search:
        s = f"%{search}%"
        query = query.filter((JobListing.title.ilike(s)) | (JobListing.company.ilike(s)) | (JobListing.description.ilike(s)))
    if domain:
        query = query.filter(JobListing.domain == domain)
    if job_type:
        query = query.filter(JobListing.job_type == job_type)
    
    jobs = query.order_by(JobListing.id.asc()).all()
    return [JobListingResponse.model_validate(j) for j in jobs]

def get_user_skills_and_text(user: User) -> tuple[List[str], str]:
    skills = []
    if user.profile and user.profile.skills:
        for s in user.profile.skills:
            if isinstance(s, dict):
                skills.append(s.get("name", ""))
            elif isinstance(s, str):
                skills.append(s)

    resume_text = ""
    if user.resumes:
        resume_text = user.resumes[0].raw_text or ""

    return list(set([s for s in skills if s])), resume_text

def match_job_listing(
    db: Session,
    user: User,
    job_id: int
) -> JobMatchResponse:
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found")

    skills, resume_text = get_user_skills_and_text(user)
    ai_provider = get_ai_provider()
    result = ai_provider.match_job(resume_text, job.description, skills)

    # Persist or update match record
    match_rec = db.query(JobMatch).filter(JobMatch.user_id == user.id, JobMatch.job_id == job.id).first()
    if not match_rec:
        match_rec = JobMatch(
            user_id=user.id,
            job_id=job.id,
            custom_job_title=job.title,
            custom_company=job.company,
            compatibility_score=result["compatibility_score"],
            matched_skills=result["matched_skills"],
            missing_skills=result["missing_skills"],
            experience_alignment=result["experience_alignment"],
            tailoring_advice=result["tailoring_advice"]
        )
        db.add(match_rec)
    else:
        match_rec.compatibility_score = result["compatibility_score"]
        match_rec.matched_skills = result["matched_skills"]
        match_rec.missing_skills = result["missing_skills"]
        match_rec.experience_alignment = result["experience_alignment"]
        match_rec.tailoring_advice = result["tailoring_advice"]

    db.commit()
    db.refresh(match_rec)

    return JobMatchResponse(
        id=match_rec.id,
        job_id=job.id,
        job_title=job.title,
        company=job.company,
        compatibility_score=result["compatibility_score"],
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
        experience_alignment=result["experience_alignment"],
        tailoring_advice=result["tailoring_advice"],
        created_at=match_rec.created_at
    )

def match_custom_job_description(
    db: Session,
    user: User,
    req: CustomJobMatchRequest
) -> JobMatchResponse:
    skills, resume_text = get_user_skills_and_text(user)
    ai_provider = get_ai_provider()
    result = ai_provider.match_job(resume_text, req.job_description, skills)

    match_rec = JobMatch(
        user_id=user.id,
        job_id=None,
        custom_job_title=req.job_title or "Target Role",
        custom_company=req.company_name or "Custom Employer",
        compatibility_score=result["compatibility_score"],
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
        experience_alignment=result["experience_alignment"],
        tailoring_advice=result["tailoring_advice"]
    )
    db.add(match_rec)
    db.commit()
    db.refresh(match_rec)

    return JobMatchResponse(
        id=match_rec.id,
        job_id=None,
        job_title=req.job_title or "Target Role",
        company=req.company_name or "Custom Employer",
        compatibility_score=result["compatibility_score"],
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
        experience_alignment=result["experience_alignment"],
        tailoring_advice=result["tailoring_advice"],
        created_at=match_rec.created_at
    )

def save_user_job(
    db: Session,
    user: User,
    req: SaveJobRequest,
    job_id: Optional[int] = None
) -> SavedJobResponse:
    target_job_id = job_id or req.job_id
    if target_job_id:
        job = db.query(JobListing).filter(JobListing.id == target_job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job listing not found")

        saved = db.query(SavedJob).filter(SavedJob.user_id == user.id, SavedJob.job_id == target_job_id).first()
        if not saved:
            saved = SavedJob(
                user_id=user.id,
                job_id=target_job_id,
                status=req.status,
                notes=req.notes
            )
            db.add(saved)
        else:
            saved.status = req.status
            if req.notes is not None:
                saved.notes = req.notes
    else:
        saved = SavedJob(
            user_id=user.id,
            job_id=None,
            custom_title=req.custom_title or "Target Position",
            custom_company=req.custom_company or "Custom Employer",
            custom_location=req.custom_location or "Remote",
            custom_salary=req.custom_salary,
            status=req.status,
            notes=req.notes
        )
        db.add(saved)

    db.commit()
    db.refresh(saved)
    return SavedJobResponse.model_validate(saved)


def get_saved_jobs(db: Session, user: User) -> List[SavedJobResponse]:
    saved = db.query(SavedJob).filter(SavedJob.user_id == user.id).order_by(SavedJob.updated_at.desc()).all()
    return [SavedJobResponse.model_validate(s) for s in saved]

def update_saved_job_status(
    db: Session,
    user: User,
    saved_id: int,
    status: str,
    notes: Optional[str] = None
) -> SavedJobResponse:
    saved = db.query(SavedJob).filter(SavedJob.id == saved_id, SavedJob.user_id == user.id).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved job not found")
    saved.status = status
    if notes is not None:
        saved.notes = notes
    db.commit()
    db.refresh(saved)
    return SavedJobResponse.model_validate(saved)

def remove_saved_job(db: Session, user: User, saved_id: int) -> bool:
    saved = db.query(SavedJob).filter(SavedJob.id == saved_id, SavedJob.user_id == user.id).first()
    if not saved:
        return False
    db.delete(saved)
    db.commit()
    return True
