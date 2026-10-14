from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class InterviewQuestionBase(BaseModel):
    category: str = "Technical"  # Technical, Behavioral, System Design
    target_skill: str
    question_text: str
    suggested_answer_points: List[str] = []
    star_guidance: Optional[Dict[str, str]] = None
    pitfalls_to_avoid: List[str] = []
    user_notes: Optional[str] = None
    is_practiced: bool = False
    mastery_rating: int = 0

class InterviewQuestionResponse(InterviewQuestionBase):
    id: int
    session_id: int
    order_num: int

    model_config = ConfigDict(from_attributes=True)

class InterviewQuestionUpdate(BaseModel):
    user_notes: Optional[str] = None
    is_practiced: Optional[bool] = None
    mastery_rating: Optional[int] = None

class InterviewSessionBase(BaseModel):
    role_title: str
    company: Optional[str] = "Target Company"
    difficulty: str = "Mid-Level"

class InterviewGenerateRequest(InterviewSessionBase):
    focus_skills: Optional[List[str]] = None
    role_id: Optional[int] = None
    job_id: Optional[int] = None
    question_count: int = 5

class InterviewSessionResponse(InterviewSessionBase):
    id: int
    user_id: int
    created_at: datetime
    questions: List[InterviewQuestionResponse] = []
    practiced_count: Optional[int] = 0
    readiness_percentage: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
