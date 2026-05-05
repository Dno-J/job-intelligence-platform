import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

# Import models so SQLAlchemy registers all tables
from models.user import User
from models.job import Job, Company
from models.skill import Skill
from models.job_skill import JobSkill
from models.saved_job import SavedJob
from models.cleanup_log import CleanupLog
from models.profile import Profile
from api.admin import router as admin_router

from api.auth import router as auth_router
from api.jobs import router as jobs_router
from api.companies import router as companies_router
from api.analytics import router as analytics_router
from api.saved_jobs import router as saved_jobs_router
from api.profile import router as profile_router


app = FastAPI(
    title="Job Intelligence API",
    description="Backend for job analytics, scraping, and insights",
    version="1.0.0",
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


def get_allowed_origins():
    raw_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )

    return [
        origin.strip()
        for origin in raw_origins.split(",")
        if origin.strip()
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(auth_router)
app.include_router(jobs_router, tags=["Jobs"])
app.include_router(companies_router)
app.include_router(analytics_router)
app.include_router(saved_jobs_router)
app.include_router(profile_router)
app.include_router(admin_router)


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Job Intelligence API running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "job-intelligence-api",
    }