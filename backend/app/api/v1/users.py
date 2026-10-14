from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database import get_db
from app.models.user import User, Profile
from app.schemas.user import ProfileResponse, ProfileUpdate, UserResponse, UserDataExportResponse
from app.core.deps import get_current_active_user
from app.services.resume_service import calculate_profile_completeness, get_user_resumes
from app.services.career_service import get_career_recommendations
from app.services.job_service import get_saved_jobs
from app.services.learning_service import get_user_roadmaps
from app.services.interview_service import get_user_interview_sessions
import shutil
import os
from app.config import settings

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

@router.get("/export", response_model=UserDataExportResponse)
def export_user_data(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile_resp = ProfileResponse.model_validate(current_user.profile) if current_user.profile else None
    user_resp = UserResponse.model_validate(current_user)
    resumes_resp = [r.model_dump() for r in get_user_resumes(db, current_user)]
    career_recs = [c.model_dump() for c in get_career_recommendations(db, current_user, limit=10)]
    saved_jobs = [j.model_dump() for j in get_saved_jobs(db, current_user)]
    roadmaps = [r.model_dump() for r in get_user_roadmaps(db, current_user)]
    interviews = [i.model_dump() for i in get_user_interview_sessions(db, current_user)]

    job_matches = [
        {
            "id": m.id,
            "job_title": m.custom_job_title or (m.job.title if m.job else "Target Role"),
            "company": m.custom_company or (m.job.company if m.job else "Target Employer"),
            "compatibility_score": m.compatibility_score,
            "matched_skills": m.matched_skills,
            "missing_skills": m.missing_skills,
            "experience_alignment": m.experience_alignment,
            "created_at": m.created_at.isoformat() if m.created_at else None
        }
        for m in (current_user.job_matches or [])
    ]

    return UserDataExportResponse(
        user=user_resp,
        profile=profile_resp,
        resumes=resumes_resp,
        career_recommendations=career_recs,
        saved_jobs=saved_jobs,
        job_matches=job_matches,
        learning_roadmaps=roadmaps,
        interview_sessions=interviews,
        exported_at=datetime.now(timezone.utc),
        compliance_standard="GDPR Article 20 - Right to Data Portability"
    )


@router.get("/profile", response_model=ProfileResponse)
def get_user_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = Profile(user_id=current_user.id, completeness_score=20)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return ProfileResponse.model_validate(profile)

@router.put("/profile", response_model=ProfileResponse)
def update_user_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    update_dict = profile_in.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(profile, key, value)

    profile.completeness_score = calculate_profile_completeness(profile)
    db.commit()
    db.refresh(profile)
    return ProfileResponse.model_validate(profile)

@router.post("/onboarding", response_model=UserResponse)
def submit_onboarding(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    update_dict = payload.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(profile, key, value)

    profile.completeness_score = calculate_profile_completeness(profile)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)

@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_account(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Purge user uploaded files on disk
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, "resumes", str(current_user.id))
    if os.path.exists(user_upload_dir):
        shutil.rmtree(user_upload_dir, ignore_errors=True)

    db.delete(current_user)
    db.commit()
    return None
