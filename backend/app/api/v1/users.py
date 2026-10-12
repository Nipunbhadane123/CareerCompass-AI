from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Profile
from app.schemas.user import ProfileResponse, ProfileUpdate, UserResponse
from app.core.deps import get_current_active_user
from app.services.resume_service import calculate_profile_completeness
import shutil
import os
from app.config import settings

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

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
