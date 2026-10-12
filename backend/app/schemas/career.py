from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class SkillBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None

class SkillResponse(SkillBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class RoleSkillResponse(BaseModel):
    skill: SkillResponse
    is_required: bool
    weight: float

    model_config = ConfigDict(from_attributes=True)

class CareerRoleBase(BaseModel):
    title: str
    slug: str
    domain: str
    description: str
    average_salary: str
    experience_level: str
    market_demand: str

class CareerRoleResponse(CareerRoleBase):
    id: int
    is_active: bool
    created_at: datetime
    skills: List[RoleSkillResponse] = []

    model_config = ConfigDict(from_attributes=True)

class SkillGapItem(BaseModel):
    name: str
    category: str
    is_required: bool
    severity: str  # Critical, Secondary, Growth
    status: str  # Acquired, Missing

class CareerRecommendationResponse(BaseModel):
    role: CareerRoleResponse
    match_score: int
    required_match_pct: int
    preferred_match_pct: int
    matched_skills: List[str]
    missing_required_skills: List[str]
    missing_preferred_skills: List[str]
    fit_reasons: List[str]
    readiness_level: str  # Ready to Apply, High Match (1-2 skills gap), Moderate Bridge Needed, Foundational

class RoleGapAnalysisResponse(BaseModel):
    role: CareerRoleResponse
    overall_match_score: int
    total_required: int
    matched_required: int
    total_preferred: int
    matched_preferred: int
    skills_breakdown: List[SkillGapItem]
    next_steps: List[str]
