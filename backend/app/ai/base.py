from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.schemas.resume import ResumeAnalysisStructured

class AIProviderInterface(ABC):
    @abstractmethod
    def analyze_resume(self, text: str) -> ResumeAnalysisStructured:
        """Parses and analyzes resume text into validated structured feedback."""
        pass

    @abstractmethod
    def match_job(
        self,
        resume_text: str,
        job_description: str,
        user_skills: List[str]
    ) -> Dict[str, Any]:
        """Calculates explainable compatibility between resume/skills and job description."""
        pass

    @abstractmethod
    def generate_roadmap(
        self,
        target_role: str,
        acquired_skills: List[str],
        missing_skills: List[str],
        pace: str
    ) -> List[Dict[str, Any]]:
        """Generates sequenced learning milestones and curated resources."""
        pass
