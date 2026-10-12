from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.deps import get_current_active_user
from app.schemas.resume import (
    ResumeResponse, ResumeAnalysisResponse, ResumeAnalysisUpdate
)
from app.services.resume_service import (
    save_and_analyze_resume, get_user_resumes, get_resume_by_id,
    update_resume_analysis, delete_user_resume
)

router = APIRouter(prefix="/resumes", tags=["Resume Intelligence"])

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return save_and_analyze_resume(db, current_user, file)

@router.get("", response_model=List[ResumeResponse])
def list_resumes(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_user_resumes(db, current_user)

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    resume = get_resume_by_id(db, resume_id, current_user)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.put("/{resume_id}/analysis", response_model=ResumeAnalysisResponse)
def update_analysis(
    resume_id: int,
    payload: ResumeAnalysisUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return update_resume_analysis(db, resume_id, current_user, payload)

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    success = delete_user_resume(db, resume_id, current_user)
    if not success:
        raise HTTPException(status_code=404, detail="Resume not found")
    return None
