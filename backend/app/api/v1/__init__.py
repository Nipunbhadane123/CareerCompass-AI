from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.resumes import router as resumes_router
from app.api.v1.careers import router as careers_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.learning import router as learning_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.admin import router as admin_router
from app.api.v1.interviews import router as interviews_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(resumes_router)
api_router.include_router(careers_router)
api_router.include_router(jobs_router)
api_router.include_router(learning_router)
api_router.include_router(interviews_router)
api_router.include_router(dashboard_router)
api_router.include_router(admin_router)

