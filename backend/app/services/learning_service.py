from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.learning import LearningRoadmap, RoadmapStep
from app.models.career import CareerRole
from app.models.user import User
from app.ai import get_ai_provider
from app.services.career_service import calculate_role_compatibility
from app.schemas.learning import (
    LearningRoadmapResponse, RoadmapStepResponse, StepToggleResponse,
    LearningRoadmapGenerateRequest
)

def generate_user_roadmap(
    db: Session,
    user: User,
    req: LearningRoadmapGenerateRequest
) -> LearningRoadmapResponse:
    target_role_title = req.target_role
    role_obj = None

    if req.role_id:
        role_obj = db.query(CareerRole).filter(CareerRole.id == req.role_id).first()
        if role_obj:
            target_role_title = role_obj.title
    elif not target_role_title and user.profile and user.profile.target_role:
        target_role_title = user.profile.target_role

    if not target_role_title:
        target_role_title = "Full-Stack Software Engineer"

    # Identify user skills
    user_skills = []
    if user.profile and user.profile.skills:
        for s in user.profile.skills:
            if isinstance(s, dict):
                user_skills.append(s.get("name", ""))
            elif isinstance(s, str):
                user_skills.append(s)
    user_skills = list(set([s for s in user_skills if s]))

    # Determine missing skills
    missing_skills = []
    if role_obj:
        compat = calculate_role_compatibility(user_skills, user.profile.years_of_experience if user.profile else 0, "", role_obj)
        missing_skills = compat["missing_required_skills"] + compat["missing_preferred_skills"]
    
    if not missing_skills:
        # Default skills based on role keyword
        role_low = target_role_title.lower()
        if "data" in role_low or "ml" in role_low or "ai" in role_low:
            missing_skills = ["Python", "PyTorch", "Pandas", "PostgreSQL", "Docker"]
        elif "cloud" in role_low or "devops" in role_low:
            missing_skills = ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD"]
        else:
            missing_skills = ["TypeScript", "React", "FastAPI", "PostgreSQL", "Docker"]

    ai_provider = get_ai_provider()
    pace = req.pace or (user.profile.learning_pace if user.profile else "moderate")
    generated_steps = ai_provider.generate_roadmap(target_role_title, user_skills, missing_skills, pace)

    total_weeks = 8 if pace == "intensive" else (14 if pace == "moderate" else 20)

    roadmap = LearningRoadmap(
        user_id=user.id,
        role_id=role_obj.id if role_obj else None,
        target_role=target_role_title,
        title=f"Personalized Roadmap: {target_role_title}",
        description=f"Tailored step-by-step technical progression targeting key industry competencies for {target_role_title}.",
        estimated_weeks=total_weeks,
        pace=pace,
        progress_percentage=0
    )
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    # Add steps
    for s_data in generated_steps:
        step = RoadmapStep(
            roadmap_id=roadmap.id,
            step_order=s_data["step_order"],
            title=s_data["title"],
            skill_name=s_data["skill_name"],
            phase=s_data.get("phase", "Core Foundations"),
            description=s_data["description"],
            estimated_hours=s_data["estimated_hours"],
            resources=s_data.get("resources", []),
            practical_project=s_data.get("practical_project", "")
        )
        db.add(step)

    db.commit()
    db.refresh(roadmap)

    return LearningRoadmapResponse.model_validate(roadmap)

def get_user_roadmaps(db: Session, user: User) -> List[LearningRoadmapResponse]:
    roadmaps = db.query(LearningRoadmap).filter(LearningRoadmap.user_id == user.id).order_by(LearningRoadmap.created_at.desc()).all()
    return [LearningRoadmapResponse.model_validate(r) for r in roadmaps]

def get_roadmap_by_id(db: Session, roadmap_id: int, user: User) -> LearningRoadmapResponse:
    roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.id == roadmap_id, LearningRoadmap.user_id == user.id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Learning roadmap not found")
    return LearningRoadmapResponse.model_validate(roadmap)

def toggle_step_completion(db: Session, step_id: int, user: User) -> StepToggleResponse:
    step = db.query(RoadmapStep).join(LearningRoadmap).filter(
        RoadmapStep.id == step_id,
        LearningRoadmap.user_id == user.id
    ).first()
    if not step:
        raise HTTPException(status_code=404, detail="Roadmap step not found")

    step.is_completed = not step.is_completed
    db.commit()

    # Recalculate roadmap progress
    roadmap = step.roadmap
    all_steps = roadmap.steps
    completed_count = sum(1 for s in all_steps if s.is_completed)
    progress_pct = int(round((completed_count / max(1, len(all_steps))) * 100))
    roadmap.progress_percentage = progress_pct
    db.commit()

    return StepToggleResponse(
        step_id=step.id,
        is_completed=step.is_completed,
        roadmap_progress_percentage=progress_pct
    )

def delete_user_roadmap(db: Session, roadmap_id: int, user: User) -> bool:
    roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.id == roadmap_id, LearningRoadmap.user_id == user.id).first()
    if not roadmap:
        return False
    db.delete(roadmap)
    db.commit()
    return True
