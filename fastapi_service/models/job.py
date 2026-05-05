import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Company(Base):
    __tablename__ = "jobs_company"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )

    name = Column(String, unique=True, nullable=False, index=True)
    website = Column(String)
    industry = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    jobs = relationship(
        "Job",
        back_populates="company",
        passive_deletes=True,
    )


class Job(Base):
    __tablename__ = "jobs_job"

    __table_args__ = (
        UniqueConstraint("source_url", name="uq_job_source_url"),
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )

    title = Column(Text, nullable=False)

    company_id = Column(
        UUID(as_uuid=True),
        ForeignKey("jobs_company.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    location = Column(String)

    salary_min = Column(Integer)
    salary_max = Column(Integer)
    currency = Column(String)

    job_type = Column(String, index=True)
    experience_level = Column(String, index=True)

    description = Column(Text)

    source = Column(String, nullable=False, index=True)
    source_url = Column(String, nullable=False)

    posted_date = Column(DateTime(timezone=True))
    scraped_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
    )

    is_active = Column(
        Boolean,
        default=True,
        server_default=text("true"),
        index=True,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    company = relationship(
        "Company",
        back_populates="jobs",
    )

    skills = relationship(
        "JobSkill",
        back_populates="job",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    saved_by = relationship(
        "SavedJob",
        back_populates="job",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )