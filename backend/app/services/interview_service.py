import json
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.interview import InterviewSession, InterviewQuestion
from app.models.career import CareerRole
from app.models.job import JobListing
from app.models.user import User
from app.config import settings
from app.schemas.interview import (
    InterviewGenerateRequest, InterviewSessionResponse,
    InterviewQuestionResponse, InterviewQuestionUpdate
)

logger = logging.getLogger(__name__)

CURATED_INTERVIEW_BANK: Dict[str, List[Dict[str, Any]]] = {
    "python": [
        {
            "category": "Technical",
            "skill": "Python",
            "question": "How does Python's Global Interpreter Lock (GIL) impact multithreaded CPU-bound versus I/O-bound applications, and what architectural strategies would you use to achieve true parallelism?",
            "points": [
                "GIL ensures thread-safe memory management within CPython by executing only one bytecode instruction at a time.",
                "For I/O-bound tasks (network calls, DB queries), the GIL is released, making standard threading or asyncio highly effective.",
                "For CPU-bound tasks (data processing, ML inference), use multiprocessing, Celery workers, or native extensions (C/Rust/Cython)."
            ],
            "star": {
                "situation": "Scaling a background data transformation pipeline that blocked the web server.",
                "task": "Migrate CPU-intensive tasks out of the main asyncio event loop.",
                "action": "Implemented a ProcessPoolExecutor to distribute compute across multiple CPU cores.",
                "result": "Reduced 99th-percentile response time by 68% while utilizing 100% of available CPU cores."
            },
            "pitfalls": [
                "Confusing multithreading with multiprocessing in CPython.",
                "Assuming asyncio achieves parallel execution on multi-core CPUs without background workers."
            ]
        },
        {
            "category": "Technical",
            "skill": "Python",
            "question": "Explain the difference between Python generators and regular functions. In what production scenarios would you mandate the use of generator expressions or yield?",
            "points": [
                "Generators maintain execution state and lazily produce items on-demand using the iterator protocol (__iter__, __next__).",
                "Massive memory savings when processing large data streams, multi-gigabyte log files, or streaming API responses.",
                "Enables memory complexity of O(1) instead of loading full collections in O(N)."
            ],
            "star": {
                "situation": "Exporting hundreds of thousands of customer records caused worker out-of-memory crashes.",
                "task": "Stream database export records in manageable memory footprints.",
                "action": "Refactored the data layer to use SQLAlchemy chunked yield_per iterators and generator streaming.",
                "result": "Memory consumption dropped from 1.8GB to under 45MB while throughput remained steady."
            },
            "pitfalls": [
                "Attempting to slice or index a generator directly like a list.",
                "Consuming a generator once and expecting it to reset automatically."
            ]
        }
    ],
    "fastapi": [
        {
            "category": "Technical",
            "skill": "FastAPI",
            "question": "How does FastAPI achieve high performance using ASGI and Starlette, and how do dependency injection (Depends) and Pydantic validation enhance API security and maintainability?",
            "points": [
                "FastAPI is built on Starlette (ASGI toolkit) and Pydantic, executing asynchronous I/O with uvloop.",
                "Pydantic enforces strict runtime data coercion, type safety, and automatic OpenAPI schema generation.",
                "Depends provides modular, hierarchical, testable lifecycle management for database sessions, auth guards, and security scopes."
            ],
            "star": {
                "situation": "Legacy endpoints had duplicate authentication logic and inconsistent request validation.",
                "task": "Standardize request guards and connection handling across 40+ REST endpoints.",
                "action": "Built reusable FastAPI dependencies for JWT decoding, tenant isolation, and session rollback on exceptions.",
                "result": "Eliminated 600 lines of boilerplate, improved test coverage, and achieved sub-15ms response latency."
            },
            "pitfalls": [
                "Performing blocking synchronous file or network I/O inside async def endpoints without run_in_threadpool.",
                "Failing to close DB session generators when exceptions occur."
            ]
        }
    ],
    "react": [
        {
            "category": "Technical",
            "skill": "React",
            "question": "Explain the React 18 Concurrent Rendering model and how Fiber reconciliation differentiates from the legacy synchronous rendering pipeline.",
            "points": [
                "Fiber architecture represents the component tree as linked lists, allowing React to pause, resume, or abort render work.",
                "Concurrent features like useTransition and useDeferredValue prioritize urgent user interactions over background updates.",
                "Automatic batching across promises, timeouts, and native event handlers prevents redundant re-renders."
            ],
            "star": {
                "situation": "Typing into a complex search autocomplete caused visible UI frame drops and input lag.",
                "task": "Ensure keyboard typing stays 60fps while rendering heavy filtered results.",
                "action": "Wrapped filtering state changes in startTransition and memoized list item cards.",
                "result": "Maintained 60fps responsiveness with zero dropped frames on mid-tier mobile devices."
            },
            "pitfalls": [
                "Overusing useMemo/useCallback on trivial computations where dependency tracking costs more than recalculation.",
                "Mutating state objects directly rather than creating shallow copies."
            ]
        }
    ],
    "typescript": [
        {
            "category": "Technical",
            "skill": "TypeScript",
            "question": "How do conditional types, mapped types, and utility types (Pick, Omit, Partial, ReturnType) improve type safety in enterprise frontend architectures?",
            "points": [
                "Conditional types (T extends U ? X : Y) allow dynamic type resolution based on input constraints.",
                "Mapped types transform existing property types systematically without manual duplication.",
                "Eliminates 'any' pollution and ensures end-to-end type synchronization between backend API contracts and UI components."
            ],
            "star": {
                "situation": "API contract modifications frequently resulted in undetected runtime undefined errors in the UI.",
                "task": "Enforce strict compile-time validation between backend Pydantic schemas and frontend types.",
                "action": "Created synchronized TypeScript interfaces with discriminated unions for API state handling.",
                "result": "Reduced UI runtime TypeError bugs in production by 92%."
            },
            "pitfalls": [
                "Relying on type assertions ('as any' or non-null '!') instead of proper type guards.",
                "Creating overly convoluted types that exponentially slow down the TypeScript compiler."
            ]
        }
    ],
    "postgresql": [
        {
            "category": "Technical",
            "skill": "PostgreSQL",
            "question": "When designing high-throughput relational schemas, when would you choose B-Tree indexes versus GIN/BRIN indexes, and how do you analyze query execution with EXPLAIN ANALYZE?",
            "points": [
                "B-Tree is default and optimal for equality, range queries (<, <=, =, >=, >), and sorting.",
                "GIN (Generalized Inverted Index) is suited for composite items like JSONB, full-text search, and array containment.",
                "BRIN (Block Range Index) is ideal for naturally ordered massive append-only datasets (e.g. timeseries, timestamp logs).",
                "EXPLAIN ANALYZE reveals actual execution time, sequential scans, index scans, buffer hit ratios, and join algorithms (Hash Join, Merge Join, Nested Loop)."
            ],
            "star": {
                "situation": "A dashboard analytics query degraded to 4.2 seconds under 100k records.",
                "task": "Optimize database retrieval to satisfy a strict <200ms SLA.",
                "action": "Ran EXPLAIN ANALYZE to uncover a sequential scan on user_id, added a composite index on (user_id, created_at DESC).",
                "result": "Query execution time plummeted from 4,200ms to 8ms (Index Scan)."
            },
            "pitfalls": [
                "Over-indexing tables which drastically degrades write/insert performance and wastes disk I/O.",
                "Applying functions or type casts to indexed columns (e.g. WHERE LOWER(email) = ...) which invalidates standard indexes."
            ]
        }
    ],
    "docker": [
        {
            "category": "Technical",
            "skill": "Docker",
            "question": "How do multi-stage Docker builds reduce container image sizes and enhance production security? What caching layer best practices do you follow?",
            "points": [
                "Multi-stage builds separate build dependencies (compilers, SDKs, npm devDependencies) from the lean runtime container.",
                "Minimizes surface area for vulnerabilities by omitting package managers, shell utilities, and temporary files in the final Alpine/Distroless image.",
                "Order Dockerfile instructions from least-frequently-changing to most-frequently-changing (copy dependency manifests first, install, then copy source code) to maximize layer caching."
            ],
            "star": {
                "situation": "Production Docker images were 1.4GB, causing slow CI/CD deployment pipelines taking 12 minutes.",
                "task": "Streamline image footprint and accelerate deployment rollout.",
                "action": "Re-architected the Dockerfile using multi-stage builds with node:alpine and distroless python base images.",
                "result": "Reduced final image size to 85MB and accelerated deploy builds from 12 minutes to 90 seconds."
            },
            "pitfalls": [
                "Running container processes as the default root user instead of creating an unprivileged app user.",
                "Forgetting a .dockerignore file, causing node_modules, secrets, and caches to be copied into image context."
            ]
        }
    ]
}

BEHAVIORAL_QUESTIONS = [
    {
        "category": "Behavioral (STAR)",
        "skill": "Problem Solving & Ambiguity",
        "question": "Tell me about a time you had to deliver a critical technical feature with incomplete, contradictory, or rapidly shifting requirements. How did you proceed?",
        "points": [
            "Proactively communicated with stakeholders to identify the core objective and non-negotiable success criteria.",
            "Decomposed the problem into iterative prototypes to validate assumptions early with real feedback.",
            "Documented architectural decisions and tradeoffs openly to prevent misalignment."
        ],
        "star": {
            "situation": "Product requirements for a career recommendation algorithm were loosely specified with multiple stakeholders having conflicting ideas.",
            "task": "Deliver an explainable mathematical formula while remaining agile for future changes.",
            "action": "Created an RFC document proposing weighted scoring with isolated unit tests, and demonstrated mock outputs to team leads.",
            "result": "Aligned stakeholders within 48 hours and shipped the module 3 days ahead of deadline with zero regression."
        },
        "pitfalls": [
            "Blaming the product manager or team members for ambiguous requirements.",
            "Proceeding blindly in isolation without validating assumptions until it's too late."
        ]
    },
    {
        "category": "Behavioral (STAR)",
        "skill": "Conflict Resolution & Collaboration",
        "question": "Describe a situation where you had a strong technical disagreement with a peer or senior engineer regarding system architecture. How did you resolve it?",
        "points": [
            "Depersonalized the technical discussion and focused strictly on product constraints, scalability, and maintainability.",
            "Built empirical benchmarks or small proof-of-concepts rather than debating theoretical preferences.",
            "Committed fully to the agreed team decision once finalized (disagree and commit)."
        ],
        "star": {
            "situation": "A teammate wanted to introduce a complex distributed messaging queue for a feature that had low concurrent traffic.",
            "task": "Agree on a pragmatic architecture that balanced reliability without unnecessary operational overhead.",
            "action": "Presented latency and maintenance cost data comparing an in-process worker pool versus full Kafka setup, with a clear migration path when traffic thresholds are reached.",
            "result": "The team adopted the lightweight solution, saving 2 weeks of infrastructure setup and maintaining 99.9% uptime."
        },
        "pitfalls": [
            "Letting ego dictate technical decisions.",
            "Passive-aggressively refusing to support the chosen solution if your proposal wasn't selected."
        ]
    }
]

SYSTEM_DESIGN_QUESTIONS = [
    {
        "category": "System Design",
        "skill": "System Architecture",
        "question": "Design a scalable Resume Parsing & Asynchronous Job Matching service capable of processing 10,000 resumes per hour with sub-second retrieval for users.",
        "points": [
            "Decouple heavy text extraction and OCR into asynchronous worker queues (Celery / BullMQ / Redis).",
            "Store raw files in S3/Blob storage with pre-signed URLs; persist structured metadata and extracted vectors in relational DB + ChromaDB.",
            "Employ Redis caching for frequently requested job matches and public taxonomy roles.",
            "Implement rate limiting, tenant data isolation, and autoscaling worker nodes based on queue depth."
        ],
        "star": {
            "situation": "A surge in resume uploads caused HTTP request timeouts and degraded the platform API.",
            "task": "Architect an asynchronous background processing pipeline with progress telemetry.",
            "action": "Offloaded PDF extraction to worker tasks with status polling and Redis caching for completed analyses.",
            "result": "API latency dropped to under 50ms while background throughput scaled to handle 15,000 documents per hour."
        },
        "pitfalls": [
            "Processing heavy file parsing synchronously on the web server thread.",
            "Storing raw binary files directly in the relational database."
        ]
    }
]

def generate_interview_session(
    db: Session,
    user: User,
    req: InterviewGenerateRequest
) -> InterviewSessionResponse:
    role_title = req.role_title
    company = req.company or "Target Company"
    difficulty = req.difficulty or "Mid-Level"

    # Identify target skills
    focus_skills = req.focus_skills or []
    if not focus_skills and user.profile and user.profile.skills:
        for s in user.profile.skills:
            if isinstance(s, str):
                focus_skills.append(s)
            elif isinstance(s, dict):
                focus_skills.append(s.get("name", ""))
    focus_skills = [s for s in focus_skills if s][:6]
    if not focus_skills:
        focus_skills = ["Python", "FastAPI", "React", "Docker", "PostgreSQL"]

    # Assemble questions
    assembled_questions: List[Dict[str, Any]] = []

    # 1. Technical questions matched to focus skills
    for skill in focus_skills:
        s_low = skill.lower()
        matched_pool = None
        for bank_key, q_list in CURATED_INTERVIEW_BANK.items():
            if bank_key in s_low or s_low in bank_key:
                matched_pool = q_list
                break
        
        if matched_pool:
            assembled_questions.append(matched_pool[0])
        else:
            # Generic technical deep-dive question for this skill
            assembled_questions.append({
                "category": "Technical",
                "skill": skill,
                "question": f"In a production system utilizing {skill}, what are the most common performance bottlenecks or concurrency pitfalls you have encountered, and how do you monitor and remediate them?",
                "points": [
                    f"Explain architectural principles and idiomatic design patterns when working with {skill}.",
                    f"Discuss debugging strategies, profiling tools, and telemetry metrics (latency, error rates, resource usage) relevant to {skill}.",
                    f"Highlight trade-offs between rapid prototyping and production maintainability in {skill} applications."
                ],
                "star": {
                    "situation": f"Diagnosing an intermittent latency spike in a module built with {skill}.",
                    "task": f"Profile and optimize resource allocation without breaking backward compatibility.",
                    "action": f"Instrumented detailed logging and isolated hot code paths for optimization.",
                    "result": f"Stabilized 99th percentile response time and reduced CPU utilization by 40%."
                },
                "pitfalls": [
                    f"Giving purely theoretical definitions without mentioning practical trade-offs or production debugging experience in {skill}."
                ]
            })

    # 2. Add Behavioral STAR Question
    assembled_questions.append(BEHAVIORAL_QUESTIONS[0])

    # 3. Add System Design Question if question count >= 4
    assembled_questions.append(SYSTEM_DESIGN_QUESTIONS[0])

    # Limit to requested count
    target_count = max(3, min(10, req.question_count))
    final_questions = assembled_questions[:target_count]

    # Create Session in DB
    session = InterviewSession(
        user_id=user.id,
        role_title=role_title,
        company=company,
        difficulty=difficulty
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Create Questions in DB
    for idx, q_data in enumerate(final_questions):
        q = InterviewQuestion(
            session_id=session.id,
            order_num=idx + 1,
            category=q_data.get("category", "Technical"),
            target_skill=q_data.get("skill", role_title),
            question_text=q_data["question"],
            suggested_answer_points=q_data.get("points", []),
            star_guidance=q_data.get("star", {}),
            pitfalls_to_avoid=q_data.get("pitfalls", []),
            is_practiced=False,
            mastery_rating=0
        )
        db.add(q)

    db.commit()
    db.refresh(session)

    resp = InterviewSessionResponse.model_validate(session)
    resp.practiced_count = 0
    resp.readiness_percentage = 0
    return resp

def get_user_interview_sessions(db: Session, user: User) -> List[InterviewSessionResponse]:
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user.id
    ).order_by(InterviewSession.created_at.desc()).all()

    results = []
    for s in sessions:
        resp = InterviewSessionResponse.model_validate(s)
        total = len(s.questions)
        practiced = sum(1 for q in s.questions if q.is_practiced)
        resp.practiced_count = practiced
        resp.readiness_percentage = int(round((practiced / max(1, total)) * 100))
        results.append(resp)
    return results

def get_interview_session_by_id(
    db: Session,
    session_id: int,
    user: User
) -> InterviewSessionResponse:
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    resp = InterviewSessionResponse.model_validate(session)
    total = len(session.questions)
    practiced = sum(1 for q in session.questions if q.is_practiced)
    resp.practiced_count = practiced
    resp.readiness_percentage = int(round((practiced / max(1, total)) * 100))
    return resp

def update_interview_question(
    db: Session,
    question_id: int,
    user: User,
    update_data: InterviewQuestionUpdate
) -> InterviewQuestionResponse:
    question = db.query(InterviewQuestion).join(InterviewSession).filter(
        InterviewQuestion.id == question_id,
        InterviewSession.user_id == user.id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Interview question not found")

    if update_data.user_notes is not None:
        question.user_notes = update_data.user_notes
    if update_data.is_practiced is not None:
        question.is_practiced = update_data.is_practiced
    if update_data.mastery_rating is not None:
        question.mastery_rating = max(0, min(5, update_data.mastery_rating))

    db.commit()
    db.refresh(question)
    return InterviewQuestionResponse.model_validate(question)

def delete_interview_session(db: Session, session_id: int, user: User) -> bool:
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == user.id
    ).first()
    if not session:
        return False
    db.delete(session)
    db.commit()
    return True
