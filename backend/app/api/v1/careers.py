from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.career import CareerRole
from app.core.deps import get_current_active_user
from app.schemas.career import (
    CareerRoleResponse, CareerRecommendationResponse, RoleGapAnalysisResponse
)
from app.services.career_service import (
    get_career_recommendations, get_role_gap_analysis
)

router = APIRouter(prefix="/careers", tags=["Career Intelligence"])

@router.get("/roles", response_model=List[CareerRoleResponse])
def list_roles(
    search: Optional[str] = None,
    domain: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CareerRole).filter(CareerRole.is_active == True)
    if search:
        s = f"%{search}%"
        query = query.filter((CareerRole.title.ilike(s)) | (CareerRole.description.ilike(s)))
    if domain:
        query = query.filter(CareerRole.domain == domain)
    roles = query.all()
    return [CareerRoleResponse.model_validate(r) for r in roles]

@router.get("/roles/{role_id}", response_model=CareerRoleResponse)
def get_role_details(role_id: int, db: Session = Depends(get_db)):
    role = db.query(CareerRole).filter(CareerRole.id == role_id, CareerRole.is_active == True).first()
    if not role:
        raise HTTPException(status_code=404, detail="Career role not found")
    return CareerRoleResponse.model_validate(role)

@router.get("/recommendations", response_model=List[CareerRecommendationResponse])
def get_recommendations(
    limit: int = Query(default=6, ge=1, le=20),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_career_recommendations(db, current_user, limit=limit)

@router.get("/gap-analysis/{role_id}", response_model=RoleGapAnalysisResponse)
def get_gap_analysis(
    role_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    analysis = get_role_gap_analysis(db, role_id, current_user)
    if not analysis:
        raise HTTPException(status_code=404, detail="Career role not found")
    return analysis
