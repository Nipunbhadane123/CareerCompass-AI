import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure test settings
os.environ["ENVIRONMENT"] = "testing"
os.environ["SECRET_KEY"] = "test-secret-key-32-characters-minimum"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["AI_PROVIDER"] = "deterministic"

from app.database import Base, get_db
from app.main import app
from app.seed_data import seed_database
from app.models.user import User
from app.core.security import get_password_hash

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    # Seed baseline roles and demo users into test db
    db = TestingSessionLocal()
    try:
        from app.models.career import CareerRole, Skill, RoleSkill
        from app.models.job import JobListing

        # Seed test admin
        admin = User(
            email="admin@careercompass.ai",
            hashed_password=get_password_hash("AdminPassword123!"),
            full_name="Admin User",
            is_active=True,
            is_superuser=True
        )
        db.add(admin)

        # Seed test regular user
        user = User(
            email="testuser@careercompass.ai",
            hashed_password=get_password_hash("TestPassword123!"),
            full_name="Test Candidate",
            is_active=True,
            is_superuser=False
        )
        db.add(user)
        db.commit()

        # Seed a test role
        role = CareerRole(
            title="Full-Stack Software Engineer",
            slug="full-stack-software-engineer",
            domain="Software Engineering",
            description="Builds web applications across frontend and backend.",
            average_salary="$90,000 - $130,000",
            experience_level="Entry-Level",
            market_demand="High",
            is_active=True
        )
        db.add(role)
        db.commit()

        skill1 = Skill(name="Python", category="Language")
        skill2 = Skill(name="React", category="Framework")
        db.add_all([skill1, skill2])
        db.commit()

        db.add(RoleSkill(role_id=role.id, skill_id=skill1.id, is_required=True, weight=2.0))
        db.add(RoleSkill(role_id=role.id, skill_id=skill2.id, is_required=True, weight=2.0))
        
        job = JobListing(
            title="Junior Software Engineer",
            company="Acme Corp (Sample)",
            location="Remote",
            description="Looking for an engineer proficient in Python and React.",
            required_skills=["Python", "React"],
            is_sample=True
        )
        db.add(job)
        db.commit()
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "testuser@careercompass.ai",
        "password": "TestPassword123!"
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_headers(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@careercompass.ai",
        "password": "AdminPassword123!"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
