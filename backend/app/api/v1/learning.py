from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.deps import get_current_active_user
from app.schemas.learning import (
    LearningRoadmapResponse, StepToggleResponse, LearningRoadmapGenerateRequest
)
from app.services.learning_service import (
    generate_user_roadmap, get_user_roadmaps, get_roadmap_by_id,
    toggle_step_completion, delete_user_roadmap
)

router = APIRouter(prefix="/learning", tags=["Learning Roadmaps"])

@router.post("/roadmaps/generate", response_model=LearningRoadmapResponse, status_code=status.HTTP_201_CREATED)
def generate_roadmap(
    payload: LearningRoadmapGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return generate_user_roadmap(db, current_user, payload)

@router.get("/roadmaps", response_model=List[LearningRoadmapResponse])
def list_roadmaps(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_user_roadmaps(db, current_user)

@router.get("/roadmaps/{roadmap_id}", response_model=LearningRoadmapResponse)
def get_roadmap(
    roadmap_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_roadmap_by_id(db, roadmap_id, current_user)

@router.patch("/steps/{step_id}/toggle", response_model=StepToggleResponse)
def toggle_step(
    step_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return toggle_step_completion(db, step_id, current_user)

@router.delete("/roadmaps/{roadmap_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_roadmap(
    roadmap_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    success = delete_user_roadmap(db, roadmap_id, current_user)
    if not success:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return None
