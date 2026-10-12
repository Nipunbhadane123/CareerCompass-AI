import json
import logging
from typing import Dict, Any, List
from app.ai.base import AIProviderInterface
from app.ai.deterministic_provider import DeterministicProvider
from app.schemas.resume import ResumeAnalysisStructured
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiProvider(AIProviderInterface):
    def __init__(self, api_key: str = None, model_name: str = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        self.fallback = DeterministicProvider()
        self._client = None

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._client = genai.GenerativeModel(self.model_name)
            except Exception as e:
                logger.warning(f"Failed to configure Gemini client: {e}. Falling back to deterministic provider.")
                self._client = None

    def analyze_resume(self, text: str) -> ResumeAnalysisStructured:
        if not self._client:
            return self.fallback.analyze_resume(text)

        prompt = f"""
You are an expert career intelligence and ATS resume auditor.
Analyze the following resume text and output a valid JSON object matching the exact schema below.
Do not include any conversational filler, markdown codeblocks or quotes, output ONLY valid JSON.

Schema requirements:
{{
  "ats_score": <int 0-100 based on formatting, contact info, metrics, and standard sections>,
  "summary": "<2-3 sentence executive assessment of candidate>",
  "skills": {{
    "languages": ["<programming/markup languages>"],
    "frameworks": ["<frameworks & libraries>"],
    "databases": ["<databases>"],
    "tools_and_platforms": ["<tools, cloud, git, etc.>"],
    "soft_skills": ["<leadership, communication, etc.>"]
  }},
  "experience": [
    {{
      "company": "<company name>",
      "title": "<role title>",
      "duration": "<e.g. 2023 - 2024>",
      "location": "<location if available>",
      "highlights": ["<action verb metric bullet point>"]
    }}
  ],
  "education": [
    {{
      "institution": "<university>",
      "degree": "<degree & major>",
      "field_of_study": "<field>",
      "graduation_year": "<year>",
      "gpa": "<gpa if present>"
    }}
  ],
  "projects": [
    {{
      "title": "<project title>",
      "technologies": ["<tech>"],
      "description": "<summary of project & outcomes>",
      "link": "<link if available>"
    }}
  ],
  "certifications": ["<certification name>"],
  "strengths": ["<top 3 specific competitive strengths>"],
  "weaknesses": ["<top 3 specific weaknesses or missing sections>"],
  "recommendations": [
    {{
      "category": "<e.g. Impact & Metrics>",
      "issue": "<what needs improvement>",
      "suggestion": "<specific revision action>",
      "rationale": "<why ATS and hiring managers care>"
    }}
  ],
  "missing_elements": ["<missing sections, metrics, or links>"]
}}

Resume Text:
\"\"\"{text[:4000]}\"\"\"
"""
        try:
            response = self._client.generate_content(prompt)
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()
            data = json.loads(raw_text)
            return ResumeAnalysisStructured(**data)
        except Exception as e:
            logger.error(f"Gemini resume analysis failed: {e}. Executing fallback parser.")
            return self.fallback.analyze_resume(text)

    def match_job(
        self,
        resume_text: str,
        job_description: str,
        user_skills: List[str]
    ) -> Dict[str, Any]:
        return self.fallback.match_job(resume_text, job_description, user_skills)

    def generate_roadmap(
        self,
        target_role: str,
        acquired_skills: List[str],
        missing_skills: List[str],
        pace: str
    ) -> List[Dict[str, Any]]:
        return self.fallback.generate_roadmap(target_role, acquired_skills, missing_skills, pace)
