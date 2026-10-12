from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class JobListing(Base):
    __tablename__ = "job_listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), index=True, nullable=False)
    company = Column(String(200), index=True, nullable=False)
    location = Column(String(150), default="Remote")
    job_type = Column(String(50), default="Full-Time")  # Full-Time, Internship, Contract
    experience_level = Column(String(50), default="Entry-Level")  # Entry-Level, Mid-Level, Senior
    salary_range = Column(String(100), default="$85,000 - $120,000")
    domain = Column(String(100), index=True, default="Software Engineering")
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    is_sample = Column(Boolean, default=True)  # Clearly labels sample/demo data
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    matches = relationship("JobMatch", back_populates="job", cascade="all, delete-orphan")
    saved_by = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")

class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("job_listings.id", ondelete="CASCADE"), nullable=True, index=True)
    custom_job_title = Column(String(200), nullable=True)  # For custom pasted job descriptions
    custom_company = Column(String(200), nullable=True)
    compatibility_score = Column(Integer, default=0)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    experience_alignment = Column(String(100), default="Moderate")  # High, Moderate, Developing
    tailoring_advice = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="job_matches")
    job = relationship("JobListing", back_populates="matches")

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("job_listings.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="saved")  # saved, applied, interviewing, offered, rejected
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="saved_jobs")
    job = relationship("JobListing", back_populates="saved_by")
