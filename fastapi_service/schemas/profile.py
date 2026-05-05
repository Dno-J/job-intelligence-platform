from typing import List, Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None

    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_location: Optional[str] = None
    preferred_job_type: Optional[str] = None

    skills: List[str] = Field(default_factory=list)

    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_url: Optional[str] = None

    bio: Optional[str] = None


class ProfileUpdate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: UUID
    user_id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True