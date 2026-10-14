from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class UserBase(BaseModel):
    email: str = Field(..., pattern=r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str = Field(..., pattern=r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class ProfileBase(BaseModel):
    headline: Optional[str] = None
    years_of_experience: float = 0.0
    education_level: Optional[str] = None
    institution: Optional[str] = None
    graduation_year: Optional[int] = None
    target_role: Optional[str] = None
    learning_pace: str = "moderate"
    career_goals: Optional[str] = None
    skills: List[Any] = []

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    completeness_score: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    profile: Optional[ProfileResponse] = None

    model_config = ConfigDict(from_attributes=True)

class UserDataExportResponse(BaseModel):
    user: UserResponse
    profile: Optional[ProfileResponse] = None
    resumes: List[Any] = []
    career_recommendations: List[Any] = []
    saved_jobs: List[Any] = []
    job_matches: List[Any] = []
    learning_roadmaps: List[Any] = []
    interview_sessions: List[Any] = []
    exported_at: datetime
    compliance_standard: str = "GDPR Article 20 - Right to Data Portability"

Token.model_rebuild()

