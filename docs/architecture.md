# CareerCompass AI — System Architecture Specification

## 1. High-Level Architecture Overview

CareerCompass AI is structured as a **Modular Monolith** designed for developer ergonomics, maintainability, and horizontal scalability. The frontend is a Single-Page Application (SPA) built with React, TypeScript, and Vite, while the backend is an asynchronous REST API built with Python, FastAPI, and SQLAlchemy 2.0.

```mermaid
graph TB
    subgraph Frontend ["Frontend (React 18 + TS + Tailwind)"]
        UI[UI Components & Layouts]
        Router[React Router v6]
        Store[TanStack Query & Context]
        APIClient[Axios / Fetch API Client]
    end

    subgraph Backend ["Backend API (FastAPI)"]
        API[API Router /api/v1]
        AuthMid[Auth & JWT Middleware]
        
        subgraph Modules ["Business Modules"]
            AuthMod[Auth & Users Module]
            ResumeMod[Resume Intelligence Module]
            CareerMod[Career Recommendations Module]
            JobMod[Job Matching Module]
            RoadmapMod[Learning Roadmaps Module]
            AdminMod[Admin & Analytics Module]
        end

        subgraph AIEngine ["AI & NLP Processing Pipeline"]
            DocParser[Document Parser (PyMuPDF / docx)]
            AIProvider[AI Provider Adapter Interface]
            Gemini[Gemini 1.5 Flash Provider]
            RuleEngine[Deterministic NLP & Rule Provider]
        end
    end

    subgraph DataTier ["Persistence & Storage Tier"]
        DB[(SQL Database: SQLite / PostgreSQL)]
        FileStore[Secure Local Object / File Storage]
    end

    UI --> Router
    Router --> Store
    Store --> APIClient
    APIClient -- "REST / JSON (Bearer JWT)" --> API
    API --> AuthMid
    AuthMid --> Modules
    ResumeMod --> DocParser
    ResumeMod --> AIProvider
    CareerMod --> RuleEngine
    JobMod --> AIProvider
    RoadmapMod --> AIProvider
    AIProvider --> Gemini
    AIProvider --> RuleEngine
    Modules --> DB
    DocParser --> FileStore
```

---

## 2. Component Breakdown

### 2.1 Frontend Client
- **Tech Stack**: React, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
- **Routing**: Client-side routing with `react-router-dom`, including public routes (`/`, `/login`, `/register`), onboarding flow (`/onboarding`), protected app routes (`/dashboard`, `/resumes`, `/careers`, `/jobs`, `/roadmap`, `/settings`), and admin-only routes (`/admin`).
- **State Management**:
  - `AuthContext`: Manages current user session, tokens, and role credentials.
  - `TanStack Query`: Manages server-side caching, revalidation, and loading/error states.
- **Visual Design Identity**:
  - Deep Navy / Charcoal canvas (`#0A0D17`, `#0F172A`).
  - Layered Slate / Midnight cards (`#1E293B`, `#161F38`).
  - Electric Violet & Indigo accents (`#6366F1`, `#8B5CF6`).
  - Restrained Cyan data callouts (`#06B6D4`).
  - Soft White headings (`#F8FAFC`) with cool gray body typography (`#94A3B8`).

### 2.2 Backend Application
- **Tech Stack**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0 (async & sync ORM compatible), Alembic.
- **Modular Directory Organization**:
  ```
  backend/app/
  ├── main.py               # Application factory & CORS initialization
  ├── config.py             # Pydantic BaseSettings management
  ├── database.py           # SQLAlchemy engine & session factory
  ├── core/                 # Security, JWT tokens, dependencies, exceptions
  ├── models/               # Declarative SQLAlchemy ORM models
  ├── schemas/              # Pydantic v2 validation contracts
  ├── repositories/         # Database persistence queries
  ├── services/             # Core business & algorithmic logic
  ├── ai/                   # AI interfaces, Gemini client, deterministic engine
  └── api/v1/               # Versioned REST endpoints
  ```

### 2.3 AI & Document Processing Pipeline
- **Document Ingestion**:
  - `PyMuPDF` (`fitz`) handles rapid, reliable vector and text extraction from `.pdf` resumes.
  - `python-docx` parses `.docx` XML trees for structured paragraph and table text.
- **Dual AI Engine**:
  - `AIProviderInterface`: Abstract base class defining `extract_resume()`, `analyze_resume()`, `match_job()`, and `generate_roadmap()`.
  - `GeminiProvider`: Connects to Google Generative AI using strictly validated Pydantic JSON schemas.
  - `DeterministicProvider`: Built-in rule-based NLP engine using keyword taxonomies, regular expressions, and algorithmic scoring. Ensures zero external dependency failure and flawless local evaluation.

### 2.4 Data Tier
- **Database Engine**: SQLAlchemy supports PostgreSQL for production deployments and SQLite for seamless, zero-config local prototyping.
- **File Storage**: User resumes are stored in isolated per-user directories (`uploads/resumes/{user_id}/`) with generated UUID filenames to prevent collision and directory traversal exploits.
