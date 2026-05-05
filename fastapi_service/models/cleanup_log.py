import uuid

from sqlalchemy import Column, DateTime, Integer, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database import Base


class CleanupLog(Base):
    __tablename__ = "jobs_cleanuplog"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )

    run_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    jobs_marked_inactive = Column(
        Integer,
        default=0,
        server_default=text("0"),
        nullable=False,
    )

    jobs_deleted = Column(
        Integer,
        default=0,
        server_default=text("0"),
        nullable=False,
    )