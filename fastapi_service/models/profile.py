import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Profile(Base):
    __tablename__ = "user_profiles"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    full_name = Column(String)
    headline = Column(String)

    target_role = Column(String)
    experience_level = Column(String)
    preferred_location = Column(String)
    preferred_job_type = Column(String)

    skills = Column(
        ARRAY(String),
        nullable=False,
        server_default=text("'{}'::varchar[]"),
    )

    github_url = Column(String)
    linkedin_url = Column(String)
    portfolio_url = Column(String)
    resume_url = Column(String)

    bio = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
    )

    user = relationship(
        "User",
        back_populates="profile",
    )