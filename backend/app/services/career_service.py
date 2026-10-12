from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.career import CareerRole, Skill, RoleSkill
from app.models.user import User, Profile
from app.schemas.career import (
    CareerRecommendationResponse, CareerRoleResponse,
    RoleGapAnalysisResponse, SkillGapItem
)

def calculate_role_compatibility(
    user_skills: List[str],
    user_exp_years: float,
    user_edu_level: str,
    role: CareerRole
) -> Dict[str, Any]:
    user_skills_normalized = {s.strip().lower() for s in user_skills if isinstance(s, str)}

    required_skills = [rs for rs in role.skills if rs.is_required]
    preferred_skills = [rs for rs in role.skills if not rs.is_required]

    req_matched = [rs.skill.name for rs in required_skills if rs.skill.name.lower() in user_skills_normalized]
    req_missing = [rs.skill.name for rs in required_skills if rs.skill.name.lower() not in user_skills_normalized]

    pref_matched = [rs.skill.name for rs in preferred_skills if rs.skill.name.lower() in user_skills_normalized]
    pref_missing = [rs.skill.name for rs in preferred_skills if rs.skill.name.lower() not in user_skills_normalized]

    # Required skill match percentage
    req_pct = (len(req_matched) / max(1, len(required_skills))) * 100
    # Preferred skill match percentage
    pref_pct = (len(pref_matched) / max(1, len(preferred_skills))) * 100

    # Experience alignment factor (0-100)
    exp_factor = min(100.0, (user_exp_years / 2.0) * 100.0) if user_exp_years > 0 else 50.0

    # Education factor (0-100)
    edu_lower = (user_edu_level or "").lower()
    if any(k in edu_lower for k in ["master", "bachelor", "degree", "b.s", "b.tech", "m.s"]):
        edu_factor = 95.0
    elif "self-taught" in edu_lower or "bootcamp" in edu_lower:
        edu_factor = 80.0
    else:
        edu_factor = 70.0

    # Weighted Score Formula
    total_score = (0.50 * req_pct) + (0.25 * pref_pct) + (0.15 * exp_factor) + (0.10 * edu_factor)
    final_score = int(min(99, max(15, round(total_score))))

    # Fit reasons
    fit_reasons = []
    if req_matched:
        fit_reasons.append(f"Demonstrated command of core requirements: {', '.join(req_matched[:3])}.")
    if pref_matched:
        fit_reasons.append(f"Bonus alignment with preferred domain competencies: {', '.join(pref_matched[:2])}.")
    if user_exp_years >= 1.0:
        fit_reasons.append(f"Relevant professional background ({user_exp_years:.1f} years).")
    else:
        fit_reasons.append("Strong academic and self-directed project foundation.")

    # Readiness level
    if final_score >= 80:
        readiness = "Ready to Apply"
    elif final_score >= 60:
        readiness = "High Match (1-2 skills gap)"
    elif final_score >= 40:
        readiness = "Moderate Bridge Needed"
    else:
        readiness = "Foundational Stage"

    return {
        "match_score": final_score,
        "required_match_pct": int(round(req_pct)),
        "preferred_match_pct": int(round(pref_pct)),
        "matched_skills": req_matched + pref_matched,
        "missing_required_skills": req_missing,
        "missing_preferred_skills": pref_missing,
        "fit_reasons": fit_reasons,
        "readiness_level": readiness
    }

def get_career_recommendations(
    db: Session,
    user: User,
    limit: int = 10
) -> List[CareerRecommendationResponse]:
    profile = user.profile
    user_skills = []
    user_exp = 0.0
    user_edu = ""

    if profile:
        # Profile skills can be list of strings or list of objects
        if profile.skills:
            for s in profile.skills:
                if isinstance(s, dict):
                    user_skills.append(s.get("name", ""))
                elif isinstance(s, str):
                    user_skills.append(s)
        user_exp = profile.years_of_experience or 0.0
        user_edu = profile.education_level or ""

    # Also pull skills from latest resume if profile skills are few
    if len(user_skills) < 5 and user.resumes:
        latest_res = user.resumes[0]
        if latest_res.analyses:
            analysis = latest_res.analyses[0]
            if isinstance(analysis.extracted_skills, dict):
                for cat_skills in analysis.extracted_skills.values():
                    if isinstance(cat_skills, list):
                        user_skills.extend([s for s in cat_skills if isinstance(s, str)])

    user_skills = list(set([s for s in user_skills if s]))

    roles = db.query(CareerRole).filter(CareerRole.is_active == True).all()
    recommendations = []

    for role in roles:
        compat = calculate_role_compatibility(user_skills, user_exp, user_edu, role)
        recommendations.append(CareerRecommendationResponse(
            role=CareerRoleResponse.model_validate(role),
            match_score=compat["match_score"],
            required_match_pct=compat["required_match_pct"],
            preferred_match_pct=compat["preferred_match_pct"],
            matched_skills=compat["matched_skills"],
            missing_required_skills=compat["missing_required_skills"],
            missing_preferred_skills=compat["missing_preferred_skills"],
            fit_reasons=compat["fit_reasons"],
            readiness_level=compat["readiness_level"]
        ))

    recommendations.sort(key=lambda x: x.match_score, reverse=True)
    return recommendations[:limit]

def get_role_gap_analysis(
    db: Session,
    role_id: int,
    user: User
) -> RoleGapAnalysisResponse:
    role = db.query(CareerRole).filter(CareerRole.id == role_id).first()
    if not role:
        return None

    profile = user.profile
    user_skills = []
    user_exp = 0.0
    user_edu = ""

    if profile:
        if profile.skills:
            for s in profile.skills:
                if isinstance(s, dict):
                    user_skills.append(s.get("name", ""))
                elif isinstance(s, str):
                    user_skills.append(s)
        user_exp = profile.years_of_experience or 0.0
        user_edu = profile.education_level or ""

    user_skills_clean = {s.strip().lower() for s in user_skills if s}

    breakdown = []
    matched_req = 0
    total_req = 0
    matched_pref = 0
    total_pref = 0

    for rs in role.skills:
        s_name = rs.skill.name
        is_acquired = s_name.lower() in user_skills_clean
        if rs.is_required:
            total_req += 1
            if is_acquired:
                matched_req += 1
                severity = "Acquired"
            else:
                severity = "Critical"
        else:
            total_pref += 1
            if is_acquired:
                matched_pref += 1
                severity = "Acquired"
            else:
                severity = "Secondary"

        breakdown.append(SkillGapItem(
            name=s_name,
            category=rs.skill.category,
            is_required=rs.is_required,
            severity=severity,
            status="Acquired" if is_acquired else "Missing"
        ))

    compat = calculate_role_compatibility(list(user_skills_clean), user_exp, user_edu, role)

    next_steps = [
        f"Prioritize acquiring top missing critical skills: {', '.join(compat['missing_required_skills'][:3]) or 'None (All core acquired)'}.",
        "Generate a tailored Learning Roadmap to follow sequential project-based milestones.",
        f"Benchmark portfolio projects against typical requirements for {role.title}."
    ]

    return RoleGapAnalysisResponse(
        role=CareerRoleResponse.model_validate(role),
        overall_match_score=compat["match_score"],
        total_required=total_req,
        matched_required=matched_req,
        total_preferred=total_pref,
        matched_preferred=matched_pref,
        skills_breakdown=breakdown,
        next_steps=next_steps
    )
