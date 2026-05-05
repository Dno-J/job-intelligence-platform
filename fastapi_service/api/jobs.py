from enum import Enum
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from api.auth import get_current_user
from dependencies import get_db
from models.user import User
from schemas.job import JobListResponse, JobDetailResponse
from services.job_service import (
    get_jobs,
    get_job_by_id,
    serialize_job_list_item,
    serialize_job_detail,
)
from services.recommendation_service import get_recommended_jobs


router = APIRouter()


class JobTypeEnum(str, Enum):
    full_time = "full-time"
    part_time = "part-time"
    contract = "contract"
    internship = "internship"


class ExperienceLevelEnum(str, Enum):
    junior = "junior"
    mid = "mid"
    senior = "senior"


class SortByEnum(str, Enum):
    scraped_at = "scraped_at"
    salary_min = "salary_min"
    salary_max = "salary_max"
    title = "title"


class OrderEnum(str, Enum):
    asc = "asc"
    desc = "desc"


@router.get("/jobs", response_model=JobListResponse)
def list_jobs(
    search: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    company: Optional[str] = Query(None),
    job_type: Optional[JobTypeEnum] = Query(None),
    experience_level: Optional[ExperienceLevelEnum] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: SortByEnum = SortByEnum.scraped_at,
    order: OrderEnum = OrderEnum.desc,
    db: Session = Depends(get_db),
):
    jobs, total = get_jobs(
        db=db,
        search=search,
        location=location,
        company=company,
        job_type=job_type.value if job_type else None,
        experience_level=experience_level.value if experience_level else None,
        page=page,
        page_size=page_size,
        sort_by=sort_by.value,
        order=order.value,
    )

    return {
        "meta": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size,
        },
        "filters": {
            "search": search,
            "location": location,
            "company": company,
            "job_type": job_type.value if job_type else None,
            "experience_level": experience_level.value if experience_level else None,
        },
        "results": [
            serialize_job_list_item(job)
            for job in jobs
        ],
    }


# This route must comeBEFORE /jobs/{job_id}
# Else FastAPI treats "recommended" as a UUID job_id
@router.get("/jobs/recommended")
def recommended_jobs(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recommendations = get_recommended_jobs(
        db=db,
        user_id=current_user.id,
        limit=limit,
    )

    return {
        "total": len(recommendations),
        "results": [
            {
                "id": item["job"].id,
                "title": item["job"].title,
                "location": item["job"].location,
                "salary_min": item["job"].salary_min,
                "salary_max": item["job"].salary_max,
                "currency": item["job"].currency,
                "job_type": item["job"].job_type,
                "experience_level": item["job"].experience_level,
                "source": item["job"].source,
                "source_url": item["job"].source_url,
                "scraped_at": item["job"].scraped_at,
                "company": item["job"].company.name if item["job"].company else None,
                "match_score": item["score"],
                "matched_skills": item["matched_skills"],
                "reasons": item["reasons"],
            }
            for item in recommendations
        ],
    }


@router.get("/jobs/{job_id}", response_model=JobDetailResponse)
def get_job(job_id: UUID, db: Session = Depends(get_db)):
    job = get_job_by_id(db=db, job_id=job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return serialize_job_detail(job)