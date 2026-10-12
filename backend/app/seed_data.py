from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models.user import User, Profile
from app.models.career import CareerRole, Skill, RoleSkill
from app.models.job import JobListing
from app.core.security import get_password_hash
from app.config import settings

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Admin User
        admin = db.query(User).filter(User.email == settings.FIRST_SUPERUSER_EMAIL).first()
        if not admin:
            admin = User(
                email=settings.FIRST_SUPERUSER_EMAIL,
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                full_name="CareerCompass Administrator",
                is_active=True,
                is_superuser=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

            admin_profile = Profile(
                user_id=admin.id,
                headline="Platform Architect & Lead",
                years_of_experience=5.0,
                education_level="Master's in Computer Science",
                target_role="Principal Architect",
                learning_pace="intensive",
                skills=["Python", "FastAPI", "React", "PostgreSQL", "Docker", "Kubernetes", "AWS"],
                completeness_score=100
            )
            db.add(admin_profile)

        # 2. Demo Student User
        demo_user = db.query(User).filter(User.email == "student@careercompass.ai").first()
        if not demo_user:
            demo_user = User(
                email="student@careercompass.ai",
                hashed_password=get_password_hash("StudentPassword123!"),
                full_name="Alex Chen",
                is_active=True,
                is_superuser=False
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            demo_profile = Profile(
                user_id=demo_user.id,
                headline="Computer Science Senior & Aspiring Full-Stack Developer",
                years_of_experience=0.5,
                education_level="Bachelor of Science in Computer Science",
                institution="State University of Technology",
                graduation_year=2025,
                target_role="Full-Stack Software Engineer",
                learning_pace="moderate",
                career_goals="Secure a high-impact software engineering role at a fast-growing tech startup. Build scalable cloud-native web applications.",
                skills=["JavaScript", "React", "Python", "SQL", "Git", "HTML", "CSS"],
                completeness_score=85
            )
            db.add(demo_profile)

        # 3. Master Skills Catalog
        skills_data = [
            ("Python", "Language"),
            ("JavaScript", "Language"),
            ("TypeScript", "Language"),
            ("SQL", "Language"),
            ("Go", "Language"),
            ("Java", "Language"),
            ("C++", "Language"),
            ("HTML", "Language"),
            ("CSS", "Language"),
            ("React", "Framework"),
            ("FastAPI", "Framework"),
            ("Node.js", "Framework"),
            ("Django", "Framework"),
            ("Next.js", "Framework"),
            ("PyTorch", "Framework"),
            ("TensorFlow", "Framework"),
            ("Scikit-Learn", "Framework"),
            ("Tailwind CSS", "Framework"),
            ("PostgreSQL", "Database"),
            ("MongoDB", "Database"),
            ("Redis", "Database"),
            ("SQLite", "Database"),
            ("Docker", "DevOps"),
            ("Kubernetes", "DevOps"),
            ("AWS", "Cloud"),
            ("GCP", "Cloud"),
            ("Git", "Tool"),
            ("GitHub", "Tool"),
            ("CI/CD", "DevOps"),
            ("Linux", "Tool"),
            ("REST API", "Architecture"),
            ("GraphQL", "Architecture"),
            ("System Design", "Architecture"),
            ("Agile", "Process")
        ]

        skill_map = {}
        for name, cat in skills_data:
            s = db.query(Skill).filter(Skill.name == name).first()
            if not s:
                s = Skill(name=name, category=cat)
                db.add(s)
                db.commit()
                db.refresh(s)
            skill_map[name] = s

        # 4. Career Roles
        roles_data = [
            {
                "title": "Full-Stack Software Engineer",
                "slug": "full-stack-software-engineer",
                "domain": "Software Engineering",
                "description": "Architects, engineers, and maintains end-to-end web applications across responsive frontend clients, robust backend APIs, and reliable database layers.",
                "average_salary": "$95,000 - $135,000",
                "experience_level": "Entry to Mid-Level",
                "market_demand": "Very High",
                "required": ["JavaScript", "TypeScript", "React", "Python", "PostgreSQL", "Git", "REST API"],
                "preferred": ["Docker", "FastAPI", "Node.js", "Tailwind CSS", "CI/CD", "AWS"]
            },
            {
                "title": "Machine Learning Engineer",
                "slug": "machine-learning-engineer",
                "domain": "AI & Data",
                "description": "Designs, trains, evaluates, and deploys predictive machine learning and deep learning models to production systems with scalable inference pipelines.",
                "average_salary": "$115,000 - $160,000",
                "experience_level": "Mid to Senior",
                "market_demand": "High",
                "required": ["Python", "PyTorch", "Scikit-Learn", "SQL", "Git", "Docker"],
                "preferred": ["TensorFlow", "FastAPI", "AWS", "Linux", "CI/CD"]
            },
            {
                "title": "Cloud & DevOps Engineer",
                "slug": "cloud-devops-engineer",
                "domain": "Cloud & Infrastructure",
                "description": "Automates cloud infrastructure provisioning, optimizes CI/CD deployment pipelines, ensures zero-downtime reliability, and manages containerized orchestration clusters.",
                "average_salary": "$105,000 - $150,000",
                "experience_level": "Mid-Level",
                "market_demand": "Very High",
                "required": ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Git"],
                "preferred": ["Python", "Go", "PostgreSQL", "System Design"]
            },
            {
                "title": "Data Scientist",
                "slug": "data-scientist",
                "domain": "AI & Data",
                "description": "Extracts high-leverage business insights from complex datasets using statistical modeling, hypothesis testing, machine learning, and executive data visualizations.",
                "average_salary": "$100,000 - $140,000",
                "experience_level": "Entry to Mid-Level",
                "market_demand": "High",
                "required": ["Python", "SQL", "Scikit-Learn", "Git"],
                "preferred": ["PyTorch", "PostgreSQL", "Docker", "AWS"]
            },
            {
                "title": "Backend Platform Engineer",
                "slug": "backend-platform-engineer",
                "domain": "Software Engineering",
                "description": "Specializes in high-throughput distributed systems, resilient microservice APIs, database query optimization, caching strategies, and service reliability.",
                "average_salary": "$110,000 - $155,000",
                "experience_level": "Mid-Level",
                "market_demand": "Very High",
                "required": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Git", "REST API"],
                "preferred": ["Go", "Kubernetes", "AWS", "CI/CD", "System Design"]
            },
            {
                "title": "Frontend Engineer",
                "slug": "frontend-engineer",
                "domain": "Software Engineering",
                "description": "Crafts accessible, high-performance, polished user interfaces and client-side applications with seamless state management and rich visual animations.",
                "average_salary": "$90,000 - $130,000",
                "experience_level": "Entry to Mid-Level",
                "market_demand": "High",
                "required": ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Git"],
                "preferred": ["Next.js", "Tailwind CSS", "REST API", "GraphQL"]
            }
        ]

        for r_item in roles_data:
            role = db.query(CareerRole).filter(CareerRole.slug == r_item["slug"]).first()
            if not role:
                role = CareerRole(
                    title=r_item["title"],
                    slug=r_item["slug"],
                    domain=r_item["domain"],
                    description=r_item["description"],
                    average_salary=r_item["average_salary"],
                    experience_level=r_item["experience_level"],
                    market_demand=r_item["market_demand"],
                    is_active=True
                )
                db.add(role)
                db.commit()
                db.refresh(role)

                # Link required skills
                for s_name in r_item["required"]:
                    if s_name in skill_map:
                        db.add(RoleSkill(role_id=role.id, skill_id=skill_map[s_name].id, is_required=True, weight=2.0))

                # Link preferred skills
                for s_name in r_item["preferred"]:
                    if s_name in skill_map:
                        db.add(RoleSkill(role_id=role.id, skill_id=skill_map[s_name].id, is_required=False, weight=1.0))

        # 5. Curated Sample Jobs (clearly marked is_sample=True)
        jobs_data = [
            {
                "title": "Associate Full-Stack Developer",
                "company": "Vanguard Tech Labs (Sample Listing)",
                "location": "San Francisco, CA (Hybrid)",
                "job_type": "Full-Time",
                "experience_level": "Entry-Level",
                "salary_range": "$90,000 - $115,000",
                "domain": "Software Engineering",
                "description": "Join our product squad building modern web applications. You will collaborate with designers and senior engineers to deliver user-facing features using React, TypeScript, and FastAPI. Experience with relational databases and automated testing is highly valued.",
                "required_skills": ["React", "TypeScript", "Python", "SQL", "Git"],
                "preferred_skills": ["FastAPI", "Docker", "Tailwind CSS"]
            },
            {
                "title": "Junior ML Engineer",
                "company": "Apex Intelligence Group (Sample Listing)",
                "location": "Remote (US)",
                "job_type": "Full-Time",
                "experience_level": "Entry to Mid-Level",
                "salary_range": "$110,000 - $130,000",
                "domain": "AI & Data",
                "description": "Looking for a driven ML engineer to operationalize deep learning models. Responsibilities include building preprocessing pipelines in Python, fine-tuning PyTorch models, and serving endpoints inside Docker containers.",
                "required_skills": ["Python", "PyTorch", "SQL", "Git", "Docker"],
                "preferred_skills": ["FastAPI", "AWS", "Scikit-Learn"]
            },
            {
                "title": "Cloud Platform Engineer",
                "company": "Horizon Cloud Systems (Sample Listing)",
                "location": "Austin, TX (Remote)",
                "job_type": "Full-Time",
                "experience_level": "Mid-Level",
                "salary_range": "$115,000 - $145,000",
                "domain": "Cloud & Infrastructure",
                "description": "We are seeking a Cloud Infrastructure Engineer to manage Kubernetes clusters and automated CI/CD release cycles on AWS. You will champion infrastructure-as-code and monitor application performance.",
                "required_skills": ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Git"],
                "preferred_skills": ["Python", "Go", "PostgreSQL"]
            },
            {
                "title": "Frontend Software Engineer",
                "company": "Lumina Creative Studio (Sample Listing)",
                "location": "New York, NY (Hybrid)",
                "job_type": "Full-Time",
                "experience_level": "Entry-Level",
                "salary_range": "$85,000 - $110,000",
                "domain": "Software Engineering",
                "description": "Build snappy, delightful user interfaces for our analytics dashboard product. Requires strong JavaScript/TypeScript skills, experience with React component architectures, and keen eye for design aesthetics.",
                "required_skills": ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Git"],
                "preferred_skills": ["Tailwind CSS", "Next.js", "REST API"]
            }
        ]

        for j_item in jobs_data:
            existing_job = db.query(JobListing).filter(JobListing.title == j_item["title"], JobListing.company == j_item["company"]).first()
            if not existing_job:
                job = JobListing(
                    title=j_item["title"],
                    company=j_item["company"],
                    location=j_item["location"],
                    job_type=j_item["job_type"],
                    experience_level=j_item["experience_level"],
                    salary_range=j_item["salary_range"],
                    domain=j_item["domain"],
                    description=j_item["description"],
                    required_skills=j_item["required_skills"],
                    preferred_skills=j_item["preferred_skills"],
                    is_sample=True
                )
                db.add(job)

        db.commit()
        print("Database successfully seeded with roles, skills, and sample jobs.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
