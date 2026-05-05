from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from dependencies import get_db
from api.auth import get_current_user
from models.job import Job
from models.saved_job import SavedJob
from models.user import User


router = APIRouter(prefix="/saved-jobs", tags=["Saved Jobs"])


class ApplicationStatusEnum(str, Enum):
    saved = "saved"
    applied = "applied"
    interviewing = "interviewing"
    offer = "offer"
    rejected = "rejected"


class SavedJobUpdate(BaseModel):
    status: Optional[ApplicationStatusEnum] = None
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None


def serialize_saved_job(saved_job: SavedJob):
    job = saved_job.job

    return {
        "id": job.id,
        "saved_job_id": saved_job.id,
        "title": job.title,
        "company": job.company.name if job.company else None,
        "location": job.location,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "currency": job.currency,
        "job_type": job.job_type,
        "experience_level": job.experience_level,
        "source": job.source,
        "source_url": job.source_url,
        "scraped_at": job.scraped_at,
        "application_status": saved_job.status,
        "notes": saved_job.notes,
        "applied_at": saved_job.applied_at,
        "saved_at": saved_job.created_at,
        "updated_at": saved_job.updated_at,
    }


@router.post("/{job_id}", status_code=status.HTTP_201_CREATED)
def save_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    existing_saved_job = (
        db.query(SavedJob)
        .filter(
            SavedJob.user_id == current_user.id,
            SavedJob.job_id == job_id,
        )
        .first()
    )

    if existing_saved_job:
        return {
            "message": "Job already saved",
            "job_id": job_id,
            "application_status": existing_saved_job.status,
        }

    saved_job = SavedJob(
        user_id=current_user.id,
        job_id=job_id,
        status="saved",
    )

    db.add(saved_job)
    db.commit()
    db.refresh(saved_job)

    return {
        "message": "Job saved successfully",
        "job_id": job_id,
        "application_status": saved_job.status,
    }


@router.patch("/{job_id}")
def update_saved_job(
    job_id: UUID,
    payload: SavedJobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved_job = (
        db.query(SavedJob)
        .options(joinedload(SavedJob.job).joinedload(Job.company))
        .filter(
            SavedJob.user_id == current_user.id,
            SavedJob.job_id == job_id,
        )
        .first()
    )

    if not saved_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved job not found",
        )

    if payload.status is not None:
        saved_job.status = payload.status.value

        # If user marks as applied and no applied_at is provided,
        # automatically set applied_at.
        if payload.status == ApplicationStatusEnum.applied and not saved_job.applied_at:
            saved_job.applied_at = datetime.utcnow()

    if payload.notes is not None:
        saved_job.notes = payload.notes.strip() if payload.notes else None

    if payload.applied_at is not None:
        saved_job.applied_at = payload.applied_at

    db.commit()
    db.refresh(saved_job)

    return {
        "message": "Saved job updated successfully",
        "job": serialize_saved_job(saved_job),
    }


@router.delete("/{job_id}")
def unsave_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved_job = (
        db.query(SavedJob)
        .filter(
            SavedJob.user_id == current_user.id,
            SavedJob.job_id == job_id,
        )
        .first()
    )

    if not saved_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved job not found",
        )

    db.delete(saved_job)
    db.commit()

    return {
        "message": "Job removed from saved jobs",
        "job_id": job_id,
    }


@router.get("")
def get_saved_jobs(
    status_filter: Optional[ApplicationStatusEnum] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(SavedJob)
        .join(Job, SavedJob.job_id == Job.id)
        .options(joinedload(SavedJob.job).joinedload(Job.company))
        .filter(SavedJob.user_id == current_user.id)
    )

    if status_filter:
        query = query.filter(SavedJob.status == status_filter.value)

    saved_jobs = (
        query
        .order_by(SavedJob.created_at.desc())
        .all()
    )

    return [
        serialize_saved_job(saved_job)
        for saved_job in saved_jobs
        if saved_job.job
    ]


@router.get("/stats")
def get_saved_job_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved_jobs = (
        db.query(SavedJob)
        .filter(SavedJob.user_id == current_user.id)
        .all()
    )

    stats = {
        "total": len(saved_jobs),
        "saved": 0,
        "applied": 0,
        "interviewing": 0,
        "offer": 0,
        "rejected": 0,
    }

    for saved_job in saved_jobs:
        if saved_job.status in stats:
            stats[saved_job.status] += 1

    return stats