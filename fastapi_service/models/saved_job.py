import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    __table_args__ = (
        UniqueConstraint("user_id", "job_id", name="unique_user_job"),
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    job_id = Column(
        UUID(as_uuid=True),
        ForeignKey("jobs_job.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status = Column(
        String,
        nullable=False,
        default="saved",
        server_default=text("'saved'"),
        index=True,
    )

    notes = Column(Text)

    applied_at = Column(DateTime(timezone=True))

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
    )

    # Relationships
    job = relationship(
        "Job",
        back_populates="saved_by",
    )

    user = relationship(
        "User",
        back_populates="saved_jobs",
    )