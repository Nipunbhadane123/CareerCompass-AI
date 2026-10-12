from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class LearningResource(BaseModel):
    title: str
    url: str
    type: str  # Documentation, Course, Interactive, Project, Book
    is_free: bool = True
    provider: Optional[str] = None

class RoadmapStepBase(BaseModel):
    step_order: int
    title: str
    skill_name: str
    phase: str
    description: str
    estimated_hours: int
    resources: List[LearningResource] = []
    practical_project: Optional[str] = None

class RoadmapStepResponse(RoadmapStepBase):
    id: int
    roadmap_id: int
    is_completed: bool

    model_config = ConfigDict(from_attributes=True)

class LearningRoadmapGenerateRequest(BaseModel):
    role_id: Optional[int] = None
    target_role: Optional[str] = None
    pace: Optional[str] = "moderate"  # steady, moderate, intensive

class LearningRoadmapResponse(BaseModel):
    id: int
    user_id: int
    role_id: Optional[int]
    target_role: str
    title: str
    description: Optional[str]
    estimated_weeks: int
    pace: str
    progress_percentage: int
    created_at: datetime
    updated_at: datetime
    steps: List[RoadmapStepResponse] = []

    model_config = ConfigDict(from_attributes=True)

class StepToggleResponse(BaseModel):
    step_id: int
    is_completed: bool
    roadmap_progress_percentage: int
