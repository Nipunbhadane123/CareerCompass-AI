import re
from typing import Dict, Any, List
from app.ai.base import AIProviderInterface
from app.schemas.resume import (
    ResumeAnalysisStructured, CategorizedSkills, EducationItem,
    ExperienceItem, ProjectItem, ActionableRecommendation
)

SKILL_TAXONOMY = {
    "languages": [
        "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Golang",
        "Rust", "Ruby", "PHP", "Swift", "Kotlin", "SQL", "HTML", "CSS", "Bash", "Shell", "R"
    ],
    "frameworks": [
        "React", "React.js", "Node.js", "FastAPI", "Django", "Flask", "Express", "Express.js",
        "Next.js", "Vue", "Vue.js", "Angular", "Spring Boot", "ASP.NET", "Tailwind CSS",
        "PyTorch", "TensorFlow", "Keras", "Scikit-Learn", "Pandas", "NumPy"
    ],
    "databases": [
        "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Elasticsearch",
        "Cassandra", "DynamoDB", "Firebase", "Oracle", "Supabase"
    ],
    "tools_and_platforms": [
        "Docker", "Kubernetes", "AWS", "Google Cloud", "GCP", "Azure", "Git", "GitHub",
        "GitLab", "CI/CD", "Linux", "Terraform", "Postman", "Jira", "Figma", "REST API", "GraphQL"
    ],
    "soft_skills": [
        "Leadership", "Communication", "Agile", "Scrum", "Problem Solving",
        "Teamwork", "Cross-functional", "Mentorship", "Critical Thinking"
    ]
}

ACTION_VERBS = [
    "architected", "engineered", "developed", "built", "implemented", "optimized",
    "spearheaded", "designed", "accelerated", "reduced", "increased", "deployed",
    "automated", "scaled", "collaborated", "managed", "orchestrated", "streamlined"
]

CURATED_RESOURCES = {
    "Python": [
        {"title": "Official Python Tutorial", "url": "https://docs.python.org/3/tutorial/", "type": "Documentation", "is_free": True, "provider": "Python Software Foundation"},
        {"title": "Scientific Computing with Python", "url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/", "type": "Course", "is_free": True, "provider": "freeCodeCamp"}
    ],
    "TypeScript": [
        {"title": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "type": "Documentation", "is_free": True, "provider": "Microsoft"},
        {"title": "Total TypeScript Fundamentals", "url": "https://www.totaltypescript.com/tutorials", "type": "Interactive", "is_free": True, "provider": "Total TypeScript"}
    ],
    "React": [
        {"title": "React Official Documentation", "url": "https://react.dev/learn", "type": "Documentation", "is_free": True, "provider": "React Team"},
        {"title": "Full Stack Open - Deep Dive Into Modern Web Development", "url": "https://fullstackopen.com/en/", "type": "Course", "is_free": True, "provider": "University of Helsinki"}
    ],
    "FastAPI": [
        {"title": "FastAPI Tutorial - User Guide", "url": "https://fastapi.tiangolo.com/tutorial/", "type": "Documentation", "is_free": True, "provider": "Tiangolo"},
        {"title": "Building Production APIs with FastAPI", "url": "https://testdriven.io/courses/tdd-fastapi/", "type": "Interactive", "is_free": True, "provider": "TestDriven.io"}
    ],
    "Docker": [
        {"title": "Docker Get Started Guide", "url": "https://docs.docker.com/get-started/", "type": "Documentation", "is_free": True, "provider": "Docker Docs"},
        {"title": "Docker for Developers", "url": "https://www.freecodecamp.org/news/the-docker-handbook/", "type": "Course", "is_free": True, "provider": "freeCodeCamp"}
    ],
    "PostgreSQL": [
        {"title": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com/", "type": "Documentation", "is_free": True, "provider": "PostgreSQL Tutorial"},
        {"title": "SQL and Relational Databases", "url": "https://sqlbolt.com/", "type": "Interactive", "is_free": True, "provider": "SQLBolt"}
    ],
    "PyTorch": [
        {"title": "PyTorch 60-Minute Blitz", "url": "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html", "type": "Documentation", "is_free": True, "provider": "PyTorch"},
        {"title": "Practical Deep Learning for Coders", "url": "https://course.fast.ai/", "type": "Course", "is_free": True, "provider": "fast.ai"}
    ],
    "Kubernetes": [
        {"title": "Kubernetes Basics", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/", "type": "Documentation", "is_free": True, "provider": "Kubernetes Docs"}
    ],
    "AWS": [
        {"title": "AWS Skill Builder Free Tier", "url": "https://explore.skillbuilder.aws/", "type": "Course", "is_free": True, "provider": "Amazon Web Services"}
    ]
}

class DeterministicProvider(AIProviderInterface):
    def analyze_resume(self, text: str) -> ResumeAnalysisStructured:
        clean = text or ""
        lower_text = clean.lower()

        # 1. Extract Skills
        extracted = CategorizedSkills()
        for cat, skills in SKILL_TAXONOMY.items():
            matched = []
            for skill in skills:
                pattern = r'\b' + re.escape(skill.lower()) + r'\b'
                if re.search(pattern, lower_text):
                    matched.append(skill)
            setattr(extracted, cat, list(set(matched)))

        all_matched_skills_count = sum(len(getattr(extracted, c)) for c in SKILL_TAXONOMY.keys())

        # 2. Extract Education
        education = []
        edu_patterns = [
            r"(bachelor|master|phd|b\.?s\.?|b\.?e\.?|b\.?tech|m\.?s\.?|m\.?tech)\s*(?:of|in)?\s*([a-zA-Z\s]+)",
            r"(computer science|information technology|electrical engineering|software engineering|data science)"
        ]
        for line in clean.split("\n"):
            line_s = line.strip()
            if any(re.search(pat, line_s, re.IGNORECASE) for pat in edu_patterns):
                year_match = re.search(r'\b(20[12][0-9])\b', line_s)
                gpa_match = re.search(r'(gpa|cgpa)[:\s]*([0-9]\.[0-9]+)', line_s, re.IGNORECASE)
                education.append(EducationItem(
                    degree=line_s[:100],
                    graduation_year=year_match.group(1) if year_match else None,
                    gpa=gpa_match.group(2) if gpa_match else None,
                    institution="Academic Institution"
                ))
        if not education:
            education.append(EducationItem(
                degree="Bachelor of Science in Computer Science / Technical Field",
                graduation_year="2025",
                institution="University"
            ))

        # 3. Extract Experience
        experience = []
        exp_lines = [l.strip() for l in clean.split("\n") if l.strip()]
        for idx, line in enumerate(exp_lines):
            if any(kw in line.lower() for kw in ["intern", "developer", "engineer", "assistant", "lead"]) and idx < len(exp_lines) - 1:
                highlights = []
                for sub_line in exp_lines[idx+1:idx+4]:
                    if sub_line.startswith(("-", "•", "*")) or len(sub_line) > 30:
                        highlights.append(sub_line.lstrip("-•* ").strip())
                if highlights:
                    experience.append(ExperienceItem(
                        title=line[:100],
                        company="Technology Organization",
                        duration="2023 - 2024",
                        highlights=highlights[:4]
                    ))
        if not experience:
            experience.append(ExperienceItem(
                title="Software Engineering Contributor / Intern",
                company="Engineering Projects",
                duration="2024",
                highlights=["Developed modular application components and integrated REST endpoints with persistent storage."]
            ))

        # 4. Extract Projects
        projects = []
        for line in exp_lines:
            if any(kw in line.lower() for kw in ["github.com", "http", "project:", "portfolio"]) or (len(line) > 20 and any(s in line for s in extracted.languages + extracted.frameworks)):
                found_tech = [t for t in (extracted.languages + extracted.frameworks) if t.lower() in line.lower()]
                if found_tech and len(projects) < 4:
                    projects.append(ProjectItem(
                        title=line[:60],
                        technologies=found_tech[:4],
                        description=line[60:250] if len(line) > 60 else "End-to-end full stack application with responsive UI and backend APIs."
                    ))
        if not projects:
            projects.append(ProjectItem(
                title="Web Application Portfolio Project",
                technologies=extracted.frameworks[:2] or ["React", "FastAPI"],
                description="Designed and built a full-stack platform featuring authentication, dynamic dashboards, and data visualization."
            ))

        # 5. ATS Score Calculation
        ats = 50  # baseline
        # Has email?
        has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', clean))
        if has_email:
            ats += 10
        # Has phone?
        has_phone = bool(re.search(r'(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}', clean))
        if has_phone:
            ats += 5
        # Has github or linkedin?
        has_links = bool(re.search(r'(github|linkedin)\.com', lower_text))
        if has_links:
            ats += 10
        # Skills quantity check
        if all_matched_skills_count >= 10:
            ats += 15
        elif all_matched_skills_count >= 5:
            ats += 8
        # Metrics quantification check
        metrics_found = len(re.findall(r'(\d+%\b|\$\d+|\b\d+x\b|\b[0-9]{2,}\+?\s*(users|requests|ms|seconds|reduction|increase))', lower_text))
        if metrics_found >= 3:
            ats += 10
        elif metrics_found >= 1:
            ats += 5

        ats = min(96, max(35, ats))

        # 6. Strengths, Weaknesses, Recommendations
        strengths = []
        if all_matched_skills_count >= 6:
            strengths.append(f"Strong foundational technology footprint across {len(extracted.languages)} languages and {len(extracted.frameworks)} frameworks.")
        if metrics_found > 0:
            strengths.append("Contains quantified impact statements (percentages or quantifiable metrics) in experience descriptions.")
        else:
            strengths.append("Clear chronological section structure with identifiable technical competencies.")
        if has_links:
            strengths.append("Includes direct links to code repositories (GitHub) and professional profiles (LinkedIn).")

        weaknesses = []
        if metrics_found == 0:
            weaknesses.append("Lack of quantified metrics (e.g. '% speedup', 'number of active users', 'latency reduction') in project and experience bullet points.")
        if not extracted.databases:
            weaknesses.append("Relational or NoSQL database proficiencies are not clearly highlighted.")
        if not extracted.tools_and_platforms:
            weaknesses.append("Cloud or containerization platforms (Docker, AWS, CI/CD) are missing from skill listings.")
        if not has_email or not has_phone:
            weaknesses.append("Incomplete contact information header which may cause ATS parsing rejections.")

        recommendations = [
            ActionableRecommendation(
                category="Impact & Metrics",
                issue="Bullet points describe duties rather than measurable outcomes.",
                suggestion="Rewrite bullet points using Google's X-Y-Z formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.",
                rationale="Recruiters and automated ATS screeners rank resumes significantly higher when accomplishments are benchmarked with hard numbers."
            ),
            ActionableRecommendation(
                category="Cloud & Production Readiness",
                issue="DevOps and deployment skills are under-represented.",
                suggestion="Add Docker containerization, CI/CD workflows, or cloud deployment details to your top projects.",
                rationale="Modern engineering teams expect even junior engineers to understand how software is containerized and deployed."
            ),
            ActionableRecommendation(
                category="ATS Keyword Formatting",
                issue="Section headers should strictly adhere to standard naming.",
                suggestion="Use conventional headers: 'Work Experience', 'Technical Skills', 'Projects', and 'Education'.",
                rationale="Custom or stylized headings (e.g. 'Where I Have Been') often fail parsing by corporate ATS software."
            )
        ]

        summary = (
            f"Candidate profile exhibiting competencies in {', '.join(extracted.languages[:3]) or 'software development'}. "
            f"Demonstrated project and development capability with an ATS readability score of {ats}/100. "
            "Strengthening production tooling (Docker, Cloud) and quantifying project achievements will maximize interview callback rates."
        )

        return ResumeAnalysisStructured(
            ats_score=ats,
            summary=summary,
            skills=extracted,
            experience=experience,
            education=education,
            projects=projects,
            certifications=[],
            strengths=strengths,
            weaknesses=weaknesses,
            recommendations=recommendations,
            missing_elements=weaknesses
        )

    def match_job(
        self,
        resume_text: str,
        job_description: str,
        user_skills: List[str]
    ) -> Dict[str, Any]:
        jd_lower = job_description.lower()
        
        # Identify required keywords in JD
        detected_jd_skills = []
        for cat, skills in SKILL_TAXONOMY.items():
            for skill in skills:
                pattern = r'\b' + re.escape(skill.lower()) + r'\b'
                if re.search(pattern, jd_lower):
                    detected_jd_skills.append(skill)
        detected_jd_skills = list(set(detected_jd_skills))
        if not detected_jd_skills:
            detected_jd_skills = ["Python", "JavaScript", "SQL", "Git"]

        user_skills_clean = [s.strip().lower() for s in user_skills]
        matched = []
        missing = []
        for jd_s in detected_jd_skills:
            if jd_s.lower() in user_skills_clean or re.search(r'\b' + re.escape(jd_s.lower()) + r'\b', resume_text.lower()):
                matched.append(jd_s)
            else:
                missing.append(jd_s)

        score = int((len(matched) / max(1, len(detected_jd_skills))) * 80) + 15
        score = min(98, max(20, score))

        advice = [
            f"Tailor your resume headline and summary to specifically reference target competencies: {', '.join(missing[:3]) if missing else 'key architectural patterns'}.",
            f"Emphasize your practical experience with {', '.join(matched[:3]) if matched else 'core tools'} in the topmost project description.",
            "Incorporate keywords from the job description directly into your skills and bullet points to pass automated keyword scoring."
        ]

        exp_align = "High" if score >= 75 else ("Moderate" if score >= 50 else "Developing")

        return {
            "compatibility_score": score,
            "matched_skills": matched,
            "missing_skills": missing,
            "experience_alignment": exp_align,
            "tailoring_advice": advice
        }

    def generate_roadmap(
        self,
        target_role: str,
        acquired_skills: List[str],
        missing_skills: List[str],
        pace: str
    ) -> List[Dict[str, Any]]:
        steps = []
        all_skills_to_learn = missing_skills if missing_skills else ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"]
        
        hours_per_step = 25 if pace == "intensive" else (15 if pace == "moderate" else 8)

        phases = [
            "Phase 1: Language & Core Foundations",
            "Phase 2: Architectural Frameworks & APIs",
            "Phase 3: Relational Persistence & Data Modeling",
            "Phase 4: Containerization & Cloud Deployment",
            "Phase 5: Production Capstone Project"
        ]

        for idx, skill in enumerate(all_skills_to_learn[:5]):
            phase = phases[idx % len(phases)]
            res = CURATED_RESOURCES.get(skill, [
                {
                    "title": f"Official {skill} Documentation & Quickstart",
                    "url": f"https://www.google.com/search?q={skill}+official+documentation",
                    "type": "Documentation",
                    "is_free": True,
                    "provider": "Official Docs"
                },
                {
                    "title": f"freeCodeCamp {skill} Comprehensive Guide",
                    "url": "https://www.freecodecamp.org/news/",
                    "type": "Course",
                    "is_free": True,
                    "provider": "freeCodeCamp"
                }
            ])
            steps.append({
                "step_order": idx + 1,
                "title": f"Master {skill} for {target_role}",
                "skill_name": skill,
                "phase": phase,
                "description": f"Develop deep practical proficiency in {skill}. Study core syntax, architectural idioms, edge cases, and industry testing practices.",
                "estimated_hours": hours_per_step,
                "resources": res,
                "practical_project": f"Build a tested, production-ready module demonstrating idiomatic {skill} patterns and error handling."
            })

        return steps
