from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class EducationItem(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    graduation_year: Optional[str] = None
    gpa: Optional[str] = None

class ExperienceItem(BaseModel):
    company: Optional[str] = None
    title: Optional[str] = None
    duration: Optional[str] = None
    location: Optional[str] = None
    highlights: List[str] = []

class ProjectItem(BaseModel):
    title: str
    technologies: List[str] = []
    description: Optional[str] = None
    link: Optional[str] = None

class CategorizedSkills(BaseModel):
    languages: List[str] = []
    frameworks: List[str] = []
    databases: List[str] = []
    tools_and_platforms: List[str] = []
    soft_skills: List[str] = []

class ActionableRecommendation(BaseModel):
    category: str
    issue: str
    suggestion: str
    rationale: str

class ResumeAnalysisStructured(BaseModel):
    ats_score: int = Field(ge=0, le=100)
    summary: str
    skills: CategorizedSkills
    experience: List[ExperienceItem] = []
    education: List[EducationItem] = []
    projects: List[ProjectItem] = []
    certifications: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    recommendations: List[ActionableRecommendation] = []
    missing_elements: List[str] = []

class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_id: int
    ats_score: int
    summary: Optional[str]
    extracted_skills: Any
    extracted_experience: Any
    extracted_education: Any
    extracted_projects: Any
    extracted_certifications: Any
    strengths: List[Any]
    weaknesses: List[Any]
    recommendations: List[Any]
    missing_elements: List[Any]
    ai_provider: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    file_type: str
    file_size_bytes: int
    uploaded_at: datetime
    latest_analysis: Optional[ResumeAnalysisResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ResumeAnalysisUpdate(BaseModel):
    summary: Optional[str] = None
    extracted_skills: Optional[Any] = None
    extracted_education: Optional[Any] = None
    extracted_experience: Optional[Any] = None
    extracted_projects: Optional[Any] = None
