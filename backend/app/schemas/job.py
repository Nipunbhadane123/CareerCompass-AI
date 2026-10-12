from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class JobListingBase(BaseModel):
    title: str
    company: str
    location: str
    job_type: str
    experience_level: str
    salary_range: str
    domain: str
    description: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    is_sample: bool = True

class JobListingResponse(JobListingBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CustomJobMatchRequest(BaseModel):
    job_title: Optional[str] = "Target Position"
    company_name: Optional[str] = "Prospective Employer"
    job_description: str

class JobMatchResponse(BaseModel):
    id: Optional[int] = None
    job_id: Optional[int] = None
    job_title: str
    company: str
    compatibility_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    experience_alignment: str
    tailoring_advice: List[str]
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class SaveJobRequest(BaseModel):
    status: str = "saved"  # saved, applied, interviewing, offered, rejected
    notes: Optional[str] = None

class SavedJobResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    job: JobListingResponse

    model_config = ConfigDict(from_attributes=True)
