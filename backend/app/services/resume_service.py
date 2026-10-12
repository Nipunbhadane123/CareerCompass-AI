import os
import uuid
import shutil
from typing import List, Optional
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.config import settings
from app.models.resume import Resume, ResumeAnalysis
from app.models.user import User, Profile
from app.ai.parser import extract_text_from_file
from app.ai import get_ai_provider
from app.schemas.resume import ResumeResponse, ResumeAnalysisResponse, ResumeAnalysisUpdate

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}

def calculate_profile_completeness(profile: Profile) -> int:
    score = 20  # Base registration
    if profile.headline:
        score += 15
    if profile.education_level:
        score += 15
    if profile.target_role:
        score += 15
    if profile.skills and len(profile.skills) >= 3:
        score += 20
    if profile.career_goals:
        score += 15
    return min(100, score)

def save_and_analyze_resume(
    db: Session,
    user: User,
    file: UploadFile
) -> ResumeResponse:
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Supported formats: PDF, DOCX, TXT."
        )

    # User isolated directory
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, "resumes", str(user.id))
    os.makedirs(user_upload_dir, exist_ok=True)

    file_uuid = str(uuid.uuid4())
    stored_filename = f"{file_uuid}{ext}"
    file_path = os.path.join(user_upload_dir, stored_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)
    if file_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum upload size limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Extract text
    raw_text = extract_text_from_file(file_path, ext.lstrip("."))

    # Create Resume DB record
    resume = Resume(
        user_id=user.id,
        filename=file.filename,
        file_path=file_path,
        file_type=ext.lstrip("."),
        file_size_bytes=file_size,
        raw_text=raw_text
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Run AI Analysis
    ai_provider = get_ai_provider()
    analysis_data = ai_provider.analyze_resume(raw_text)

    # Persist Analysis
    analysis = ResumeAnalysis(
        resume_id=resume.id,
        ats_score=analysis_data.ats_score,
        summary=analysis_data.summary,
        extracted_skills=analysis_data.skills.model_dump(),
        extracted_experience=[item.model_dump() for item in analysis_data.experience],
        extracted_education=[item.model_dump() for item in analysis_data.education],
        extracted_projects=[item.model_dump() for item in analysis_data.projects],
        extracted_certifications=analysis_data.certifications,
        strengths=analysis_data.strengths,
        weaknesses=analysis_data.weaknesses,
        recommendations=[rec.model_dump() for rec in analysis_data.recommendations],
        missing_elements=analysis_data.missing_elements,
        ai_provider=settings.AI_PROVIDER
    )
    db.add(analysis)
    
    # Sync skills with user profile if profile has few skills
    if user.profile:
        current_skills = user.profile.skills or []
        extracted_flat = []
        for cat_list in analysis_data.skills.model_dump().values():
            if isinstance(cat_list, list):
                extracted_flat.extend(cat_list)
        combined = list(set([str(s) for s in current_skills] + extracted_flat))
        user.profile.skills = combined[:25]
        user.profile.completeness_score = calculate_profile_completeness(user.profile)
        db.add(user.profile)

    db.commit()
    db.refresh(resume)

    latest = ResumeAnalysisResponse.model_validate(analysis)
    res_resp = ResumeResponse.model_validate(resume)
    res_resp.latest_analysis = latest
    return res_resp

def get_user_resumes(db: Session, user: User) -> List[ResumeResponse]:
    resumes = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.uploaded_at.desc()).all()
    results = []
    for r in resumes:
        resp = ResumeResponse.model_validate(r)
        if r.analyses:
            resp.latest_analysis = ResumeAnalysisResponse.model_validate(r.analyses[0])
        results.append(resp)
    return results

def get_resume_by_id(db: Session, resume_id: int, user: User) -> Optional[ResumeResponse]:
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user.id).first()
    if not resume:
        return None
    resp = ResumeResponse.model_validate(resume)
    if resume.analyses:
        resp.latest_analysis = ResumeAnalysisResponse.model_validate(resume.analyses[0])
    return resp

def update_resume_analysis(
    db: Session,
    resume_id: int,
    user: User,
    update_data: ResumeAnalysisUpdate
) -> ResumeAnalysisResponse:
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user.id).first()
    if not resume or not resume.analyses:
        raise HTTPException(status_code=404, detail="Resume analysis not found")

    analysis = resume.analyses[0]
    if update_data.summary is not None:
        analysis.summary = update_data.summary
    if update_data.extracted_skills is not None:
        analysis.extracted_skills = update_data.extracted_skills
    if update_data.extracted_education is not None:
        analysis.extracted_education = update_data.extracted_education
    if update_data.extracted_experience is not None:
        analysis.extracted_experience = update_data.extracted_experience
    if update_data.extracted_projects is not None:
        analysis.extracted_projects = update_data.extracted_projects

    db.commit()
    db.refresh(analysis)
    return ResumeAnalysisResponse.model_validate(analysis)

def delete_user_resume(db: Session, resume_id: int, user: User) -> bool:
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user.id).first()
    if not resume:
        return False
    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception:
            pass
    db.delete(resume)
    db.commit()
    return True
