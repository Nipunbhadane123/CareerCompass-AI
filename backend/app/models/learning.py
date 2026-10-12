from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True, index=True)
    target_role = Column(String(150), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    estimated_weeks = Column(Integer, default=12)
    pace = Column(String(50), default="moderate")  # steady, moderate, intensive
    progress_percentage = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="roadmaps")
    role = relationship("CareerRole", back_populates="roadmaps")
    steps = relationship("RoadmapStep", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapStep.step_order")

class RoadmapStep(Base):
    __tablename__ = "roadmap_steps"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("learning_roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    step_order = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    skill_name = Column(String(100), nullable=False)
    phase = Column(String(100), default="Core Foundations")  # Foundations, Core Competencies, Applied Projects, Production Ready
    description = Column(Text, nullable=False)
    estimated_hours = Column(Integer, default=15)
    is_completed = Column(Boolean, default=False)
    resources = Column(JSON, default=list)  # list of {title, url, type, is_free}
    practical_project = Column(Text, nullable=True)

    roadmap = relationship("LearningRoadmap", back_populates="steps")
