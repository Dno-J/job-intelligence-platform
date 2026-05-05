from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from dependencies import get_db
from models.job import Company, Job


router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("/")
def list_companies(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            Company.id,
            Company.name,
            Company.website,
            Company.industry,
            func.count(Job.id).label("job_count"),
        )
        .outerjoin(Job, Job.company_id == Company.id)
    )

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(Company.name.ilike(search_term))

    query = query.group_by(
        Company.id,
        Company.name,
        Company.website,
        Company.industry,
    )

    total_query = db.query(func.count(Company.id))

    if search:
        total_query = total_query.filter(Company.name.ilike(search_term))

    total = total_query.scalar() or 0

    companies = (
        query.order_by(func.count(Job.id).desc(), Company.name.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
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
        },
        "results": [
            {
                "id": company.id,
                "name": company.name,
                "website": company.website,
                "industry": company.industry,
                "job_count": company.job_count,
            }
            for company in companies
        ],
    }