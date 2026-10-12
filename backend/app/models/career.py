from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), default="General")  # Language, Framework, Database, DevOps, Cloud, Tool
    description = Column(Text, nullable=True)

    roles = relationship("RoleSkill", back_populates="skill", cascade="all, delete-orphan")

class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), unique=True, index=True, nullable=False)
    slug = Column(String(150), unique=True, index=True, nullable=False)
    domain = Column(String(100), index=True, nullable=False)  # Software Engineering, AI & Data, Cloud & DevOps, Product & Design
    description = Column(Text, nullable=False)
    average_salary = Column(String(100), default="$90,000 - $130,000")
    experience_level = Column(String(50), default="Entry to Mid-Level")  # Entry-Level, Mid-Level, Senior
    market_demand = Column(String(50), default="High")  # Very High, High, Moderate
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    skills = relationship("RoleSkill", back_populates="role", cascade="all, delete-orphan")
    roadmaps = relationship("LearningRoadmap", back_populates="role")

class RoleSkill(Base):
    __tablename__ = "role_skills"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    is_required = Column(Boolean, default=True)  # True = Required core skill, False = Preferred
    weight = Column(Float, default=1.0)  # relative importance

    role = relationship("CareerRole", back_populates="skills")
    skill = relationship("Skill", back_populates="roles")
