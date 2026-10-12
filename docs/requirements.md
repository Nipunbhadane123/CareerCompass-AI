# CareerCompass AI — Product Requirements Document (PRD)

## 1. Executive Summary
**CareerCompass AI** is an AI-powered Career Intelligence and Employability SaaS platform designed for college students, fresh graduates, job seekers, and career transitioners. The platform bridges the divide between educational backgrounds, raw resume descriptions, and modern job market expectations by delivering:
- Automated, structured resume parsing (PDF/DOCX) with ATS readability and gap diagnostics.
- Transparent, explainable career role recommendations based on verified competencies and interests.
- Rigorous, deterministic skill-gap calculations that isolate critical missing competencies.
- Explainable resume-to-job description match scoring with actionable tailoring guidance.
- Step-by-step personalized learning roadmaps with curated educational resources and progress tracking.

---

## 2. Target Audience & Personas
1. **The College Senior / Fresh Graduate ("Alex")**:
   - Needs: Unsure which tech roles fit their coursework and projects; wants to know what skills are missing and what projects to build next.
   - Pain point: Generic rejection emails without actionable feedback on resumes.
2. **The Career Transitioner ("Maya")**:
   - Needs: Moving from non-tech or adjacent fields into Data Science or Full-Stack Development; needs to map transferable skills and follow an orderly learning path.
   - Pain point: Overwhelmed by endless learning tutorials and conflicting advice.
3. **The Early-Career Professional ("Sam")**:
   - Needs: Wants to benchmark readiness for promotion or mid-level roles and optimize their resume for specific job descriptions.
   - Pain point: Opaque ATS filters and arbitrary match percentages on job boards.

---

## 3. Functional Requirements (FR)

### FR-1: Authentication & User Profile Management
- Secure user registration and login with email/password.
- Role-based access control (RBAC): `user` and `admin`.
- User profile containing education history, years of experience, current skills, target career roles, learning pace, and career goals.
- Profile completeness tracking score (0-100%).

### FR-2: Resume Intelligence
- File upload supporting PDF and DOCX formats up to 10MB.
- File integrity and format validation.
- Structured extraction: Summary, Contact Details, Education (degree, institution, graduation year, GPA), Experience (company, title, duration, responsibilities), Projects (title, technologies, description), Skills (categorized into languages, frameworks, databases, tools, soft skills), and Certifications.
- Deep resume feedback:
  - Estimated ATS readability score (0-100).
  - Categorized strengths (strong action verbs, quantified metrics, relevant tech stack).
  - Weaknesses and warnings (missing metrics, lack of links, vague descriptions).
  - Actionable recommendations with clear rationale.
- Extracted profile review screen allowing user adjustments.
- Downloadable/exportable resume intelligence report.

### FR-3: Career Intelligence & Role Exploration
- Curated career role catalog spanning Software Engineering, Machine Learning, Data Science, Cloud/DevOps, Cybersecurity, Product Management, and UI/UX.
- Role attributes: Domain, description, salary benchmark, required skills, preferred skills, typical experience expectations.
- Mathematical match calculation against the user's verified skills:
  $$\text{Score} = 0.50 \cdot \text{Match}_{\text{required}} + 0.25 \cdot \text{Match}_{\text{preferred}} + 0.15 \cdot \text{Experience} + 0.10 \cdot \text{Education}$$
- Transparent skill gap breakdown:
  - Acquired skills (matched).
  - Missing required skills (critical blockers).
  - Missing preferred skills (growth opportunities).
- Explainable fit reasoning ("Why this role fits you").

### FR-4: Job Matching & Compatibility Engine
- Searchable directory of curated sample jobs clearly labeled as "Curated Demo Vacancies".
- Custom Job Description Analyzer: Allows users to paste any external JD text to evaluate compatibility.
- Multi-dimensional compatibility report:
  - Overall compatibility index.
  - Hard skills match rate.
  - Experience level alignment.
  - Missing prerequisite skills.
  - Tailoring recommendations for the specific job description.
- Job tracking pipeline: Users can save and organize jobs by status (`Saved`, `Applied`, `Interviewing`, `Offered`).

### FR-5: Personalized Learning Roadmaps
- Roadmap generation for any selected target career role.
- Step-by-step sequencing prioritizing missing prerequisite skills before advanced tools.
- Pacing adjustments based on user commitment (Intensive: 20+ hrs/wk, Moderate: 10-15 hrs/wk, Steady: 5-8 hrs/wk).
- Milestone breakdown with estimated completion hours and difficulty.
- Curated learning resources (official documentation, reputable free courses, hands-on projects).
- Interactive completion tracking with progress bars and status toggling.

### FR-6: Administrative & Operational Intelligence
- Restricted administrator dashboard with route protection.
- High-level platform statistics: Total users, resumes parsed, match evaluations, active roadmaps.
- Processing job queue status monitor.
- Role and skill taxonomy management.

---

## 4. Non-Functional Requirements (NFR)

### NFR-1: Performance & Latency
- Fast initial page load under 1.5 seconds.
- Resume document extraction under 3 seconds in deterministic mode, under 6 seconds with cloud LLM.
- Instantaneous client-side filtering and search across roles and jobs.

### NFR-2: Security & Privacy
- Zero plaintext password storage (Argon2 / BCrypt hashing).
- JWT authentication with secure expiry and HTTP-friendly bearer headers.
- Input sanitation and strict Pydantic payload validation.
- User data isolation: Strict database tenant ownership checks preventing cross-user data leakage.
- Resumes stored in user-isolated directories with content type validation.

### NFR-3: Reliability & Graceful Degradation
- Dual AI pipeline: Seamless deterministic rule-based NLP fallback when external LLM API keys are unconfigured or fail.
- Database agnostic design: Fully compatible with PostgreSQL for production and SQLite for local development.

### NFR-4: Usability & Accessibility
- Linear-inspired, dark-indigo SaaS aesthetic with electric violet accents.
- Responsive design tested across desktop, tablet, and mobile viewports.
- Keyboard accessible forms with clear feedback states and ARIA labels.
