from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.deps import get_current_active_user
from app.schemas.job import (
    JobListingResponse, JobMatchResponse, SavedJobResponse,
    CustomJobMatchRequest, SaveJobRequest
)
from app.services.job_service import (
    get_job_listings, match_job_listing, match_custom_job_description,
    save_user_job, get_saved_jobs, update_saved_job_status, remove_saved_job
)

router = APIRouter(prefix="/jobs", tags=["Job Matching & Tracking"])

@router.get("", response_model=List[JobListingResponse])
def list_jobs(
    search: Optional[str] = None,
    domain: Optional[str] = None,
    job_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_job_listings(db, search=search, domain=domain, job_type=job_type)

@router.get("/saved", response_model=List[SavedJobResponse])
def list_user_saved_jobs(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_saved_jobs(db, current_user)

@router.get("/{job_id}/match", response_model=JobMatchResponse)
def match_single_job(
    job_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return match_job_listing(db, current_user, job_id)

@router.post("/match", response_model=JobMatchResponse)
def match_custom_job(
    payload: CustomJobMatchRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return match_custom_job_description(db, current_user, payload)

@router.post("/saved", response_model=SavedJobResponse)
def save_custom_or_tracked_job(
    payload: SaveJobRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return save_user_job(db, current_user, payload, job_id=payload.job_id)

@router.post("/{job_id}/save", response_model=SavedJobResponse)
def save_job(
    job_id: int,
    payload: SaveJobRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return save_user_job(db, current_user, payload, job_id=job_id)


@router.patch("/saved/{saved_id}", response_model=SavedJobResponse)
def update_saved_status(
    saved_id: int,
    status_str: str = Query(..., alias="status"),
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return update_saved_job_status(db, current_user, saved_id, status_str, notes)

@router.delete("/saved/{saved_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_job(
    saved_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    success = remove_saved_job(db, current_user, saved_id)
    if not success:
        raise HTTPException(status_code=404, detail="Saved job not found")
    return None
