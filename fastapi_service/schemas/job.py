from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel
from uuid import UUID


class CompanyResponse(BaseModel):
    id: Optional[UUID] = None
    name: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None

    class Config:
        from_attributes = True


class JobListItemResponse(BaseModel):
    id: UUID
    title: str
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    scraped_at: Optional[datetime] = None
    company: Optional[str] = None

    class Config:
        from_attributes = True


class JobDetailResponse(BaseModel):
    id: UUID
    title: str
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    description: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    posted_date: Optional[datetime] = None
    scraped_at: Optional[datetime] = None
    is_active: bool
    company: CompanyResponse

    class Config:
        from_attributes = True


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class JobFiltersResponse(BaseModel):
    search: Optional[str] = None
    location: Optional[str] = None
    company: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None


class JobListResponse(BaseModel):
    meta: PaginationMeta
    filters: JobFiltersResponse
    results: List[JobListItemResponse]