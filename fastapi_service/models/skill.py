import uuid

from sqlalchemy import Column, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class Skill(Base):
    __tablename__ = "jobs_skill"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )

    name = Column(String, nullable=False)

    normalized_name = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    jobs = relationship(
        "JobSkill",
        back_populates="skill",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )