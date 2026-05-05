import uuid

from sqlalchemy import Column, ForeignKey, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class JobSkill(Base):
    __tablename__ = "jobs_jobskill"

    __table_args__ = (
        UniqueConstraint("job_id", "skill_id", name="uq_job_skill"),
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )

    job_id = Column(
        UUID(as_uuid=True),
        ForeignKey("jobs_job.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    skill_id = Column(
        UUID(as_uuid=True),
        ForeignKey("jobs_skill.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    job = relationship("Job", back_populates="skills")
    skill = relationship("Skill", back_populates="jobs")