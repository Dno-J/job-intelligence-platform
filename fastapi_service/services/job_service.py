from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc, func, case

from models.job import Job, Company


SORT_FIELDS = {
    "scraped_at": Job.scraped_at,
    "salary_min": Job.salary_min,
    "salary_max": Job.salary_max,
    "title": Job.title,
}


def get_jobs(
    db: Session,
    search: str = None,
    location: str = None,
    company: str = None,
    job_type: str = None,
    experience_level: str = None,
    page: int = 1,
    page_size: int = 10,
    sort_by: str = "scraped_at",
    order: str = "desc",
):
    query = db.query(Job).filter(Job.is_active == True)

    relevance_score = None

    if search:
        search_term = f"%{search.strip()}%"

        relevance_score = (
            case((Job.title.ilike(search_term), 3), else_=0)
            + case((Job.company.has(Company.name.ilike(search_term)), 2), else_=0)
            + case((Job.description.ilike(search_term), 1), else_=0)
        )

        query = query.filter(
            or_(
                Job.title.ilike(search_term),
                Job.description.ilike(search_term),
                Job.company.has(Company.name.ilike(search_term)),
            )
        )

    if location:
        query = query.filter(Job.location.ilike(f"%{location.strip()}%"))

    if company:
        query = query.filter(
            Job.company.has(Company.name.ilike(f"%{company.strip()}%"))
        )

    if job_type:
        query = query.filter(Job.job_type == job_type)

    if experience_level:
        query = query.filter(Job.experience_level == experience_level)

    total = query.order_by(None).with_entities(func.count(Job.id)).scalar() or 0

    query = query.options(joinedload(Job.company))

    sort_column = SORT_FIELDS.get(sort_by, Job.scraped_at)

    if search and relevance_score is not None:
        query = query.order_by(desc(relevance_score), desc(Job.scraped_at))
    else:
        query = query.order_by(
            desc(sort_column) if order == "desc" else asc(sort_column)
        )

    jobs = (
        query.offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return jobs, total


def get_job_by_id(db: Session, job_id):
    return (
        db.query(Job)
        .options(joinedload(Job.company))
        .filter(Job.id == job_id)
        .first()
    )


def serialize_job_list_item(job: Job):
    return {
        "id": job.id,
        "title": job.title,
        "location": job.location,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "currency": job.currency,
        "job_type": job.job_type,
        "experience_level": job.experience_level,
        "source": job.source,
        "source_url": job.source_url,
        "scraped_at": job.scraped_at,
        "company": job.company.name if job.company else None,
    }


def serialize_job_detail(job: Job):
    return {
        "id": job.id,
        "title": job.title,
        "location": job.location,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "currency": job.currency,
        "job_type": job.job_type,
        "experience_level": job.experience_level,
        "description": job.description,
        "source": job.source,
        "source_url": job.source_url,
        "posted_date": job.posted_date,
        "scraped_at": job.scraped_at,
        "is_active": job.is_active,
        "company": {
            "id": job.company.id if job.company else None,
            "name": job.company.name if job.company else None,
            "website": job.company.website if job.company else None,
            "industry": job.company.industry if job.company else None,
        },
    }