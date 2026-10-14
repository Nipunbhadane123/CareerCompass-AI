from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role_title = Column(String(200), nullable=False)
    company = Column(String(200), default="Target Company")
    difficulty = Column(String(50), default="Mid-Level")  # Entry-Level, Mid-Level, Senior
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="interview_sessions")
    questions = relationship(
        "InterviewQuestion",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="InterviewQuestion.order_num"
    )

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    order_num = Column(Integer, default=1)
    category = Column(String(50), default="Technical")  # Technical, Behavioral, System Design
    target_skill = Column(String(100), nullable=False)
    question_text = Column(Text, nullable=False)
    suggested_answer_points = Column(JSON, default=list)
    star_guidance = Column(JSON, default=dict)
    pitfalls_to_avoid = Column(JSON, default=list)
    user_notes = Column(Text, nullable=True)
    is_practiced = Column(Boolean, default=False)
    mastery_rating = Column(Integer, default=0)  # 0 to 5

    session = relationship("InterviewSession", back_populates="questions")
