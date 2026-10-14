from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.deps import get_current_active_user
from app.schemas.interview import (
    InterviewGenerateRequest, InterviewSessionResponse,
    InterviewQuestionResponse, InterviewQuestionUpdate
)
from app.services.interview_service import (
    generate_interview_session, get_user_interview_sessions,
    get_interview_session_by_id, update_interview_question,
    delete_interview_session
)

router = APIRouter(prefix="/interviews", tags=["AI Interview Preparation"])

@router.post("/generate", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
def create_interview_session(
    payload: InterviewGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return generate_interview_session(db, current_user, payload)

@router.get("", response_model=List[InterviewSessionResponse])
def list_interview_sessions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_user_interview_sessions(db, current_user)

@router.get("/{session_id}", response_model=InterviewSessionResponse)
def get_interview_session(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_interview_session_by_id(db, session_id, current_user)

@router.patch("/questions/{question_id}", response_model=InterviewQuestionResponse)
def update_question_progress(
    question_id: int,
    payload: InterviewQuestionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return update_interview_question(db, question_id, current_user, payload)

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    success = delete_interview_session(db, session_id, current_user)
    if not success:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return None
