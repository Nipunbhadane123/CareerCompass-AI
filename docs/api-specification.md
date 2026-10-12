# CareerCompass AI — REST API Specification

## 1. API Conventions
- **Base URL**: `/api/v1`
- **Content-Type**: `application/json` (except file uploads which use `multipart/form-data`)
- **Authentication**: Bearer Token in `Authorization` header (`Bearer <access_token>`)
- **Standard Error Format**:
  ```json
  {
    "detail": "Error description message"
  }
  ```

---

## 2. Endpoints Overview

### 2.1 Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user account | No |
| `POST` | `/auth/login` | Login and receive JWT access token | No |
| `GET` | `/auth/me` | Retrieve authenticated user profile | Yes |

### 2.2 Profile & Onboarding (`/api/v1/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/users/profile` | Get current user profile & completeness | Yes |
| `PUT` | `/users/profile` | Update profile details (education, pace, skills) | Yes |
| `POST` | `/users/onboarding` | Submit multi-step onboarding wizard data | Yes |
| `DELETE`| `/users/account` | Delete user account and purge personal data | Yes |

### 2.3 Resume Intelligence (`/api/v1/resumes`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/resumes/upload` | Upload PDF/DOCX resume file & trigger parsing | Yes |
| `GET` | `/resumes` | List user resumes | Yes |
| `GET` | `/resumes/{resume_id}` | Retrieve specific resume & latest analysis | Yes |
| `POST` | `/resumes/{resume_id}/analyze` | Trigger re-analysis of resume | Yes |
| `PUT` | `/resumes/{resume_id}/analysis` | Update extracted details manually | Yes |
| `DELETE`| `/resumes/{resume_id}` | Delete resume file and associated analyses | Yes |

### 2.4 Career Intelligence (`/api/v1/careers`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/careers/roles` | List all curated career roles with search/filter | No / Yes |
| `GET` | `/careers/roles/{role_id}` | Get specific role details and skill taxonomy | No / Yes |
| `GET` | `/careers/recommendations` | Get personalized career role recommendations | Yes |
| `GET` | `/careers/gap-analysis/{role_id}`| Detailed skill gap breakdown for role | Yes |

### 2.5 Job Matching & Applications (`/api/v1/jobs`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/jobs` | List curated sample jobs with search & filters | Yes |
| `GET` | `/jobs/{job_id}` | Retrieve specific job listing details | Yes |
| `POST` | `/jobs/match` | Compute match against custom JD text | Yes |
| `GET` | `/jobs/{job_id}/match` | Compute match against specific job listing | Yes |
| `GET` | `/jobs/saved` | List user's saved/tracked jobs | Yes |
| `POST` | `/jobs/{job_id}/save` | Save job to tracker with status | Yes |
| `PATCH`| `/jobs/saved/{saved_id}` | Update application status (`applied`, etc.) | Yes |
| `DELETE`| `/jobs/saved/{saved_id}` | Remove job from tracker | Yes |

### 2.6 Learning Roadmaps (`/api/v1/learning`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/learning/roadmaps` | List user roadmaps | Yes |
| `POST` | `/learning/roadmaps/generate` | Generate personalized roadmap for target role | Yes |
| `GET` | `/learning/roadmaps/{roadmap_id}` | Get roadmap details and milestone steps | Yes |
| `PATCH`| `/learning/steps/{step_id}/toggle`| Toggle milestone completion status | Yes |
| `DELETE`| `/learning/roadmaps/{roadmap_id}` | Delete a roadmap | Yes |

### 2.7 Dashboard & System (`/api/v1/dashboard`, `/api/v1/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/dashboard/summary` | Aggregated dashboard metrics & recent activity | Yes |
| `GET` | `/admin/metrics` | System-wide statistics and counts | Admin Only |
| `GET` | `/admin/jobs/status` | Processing job queue status | Admin Only |
| `POST` | `/admin/seed-data` | Seed / reset baseline curated data | Admin Only |
| `GET` | `/health` | System health and database connectivity | No |
