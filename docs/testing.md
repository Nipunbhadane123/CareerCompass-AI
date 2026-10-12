# CareerCompass AI — Verification and Testing Strategy

## 1. Testing Strategy Overview
The CareerCompass AI test harness verifies the system across three core layers:
1. **Unit & Algorithm Tests**: Deterministic scoring formulas, ATS readability evaluation, skill-gap categorization, and roadmap sequencing.
2. **API Integration Tests**: FastAPI endpoint tests using HTTPX and SQLite in-memory/test database covering authentication, user isolation, resume uploading, job matching, and roadmap generation.
3. **Frontend Build & Component Tests**: Strict TypeScript compilation checks, Vite production build verification, and UI state resilience.

---

## 2. Test Execution Commands

### 2.1 Backend Tests
```bash
# Activate virtual environment
source backend/venv/bin/activate

# Run full pytest suite with coverage
pytest backend/tests -v
```

### 2.2 Frontend Build & Lint Verification
```bash
cd frontend
npm run lint
npm run build
```

---

## 3. Acceptance Verification Checklist
- [x] Application foundation: auth registration, login, token refresh, RBAC.
- [x] User isolation: User A cannot read or mutate User B's resumes or roadmaps.
- [x] Resume processing: Validates PDF/DOCX files, rejects corrupt or oversized files.
- [x] AI extraction: Pydantic models validate all resume fields.
- [x] Career recommendation: Deterministic calculation formula accurately scores roles based on user skills.
- [x] Job matching: Accurately identifies matched and missing competencies with actionable suggestions.
- [x] Roadmap tracking: Steps can be toggled and progress percentages persist correctly.
- [x] Admin security: Non-admin users are rejected from `/api/v1/admin/*` endpoints with 403 Forbidden.
