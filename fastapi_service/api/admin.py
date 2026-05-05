import os

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from dependencies import get_db
from services.manual_scraper_service import manual_scrape_once


router = APIRouter(prefix="/admin", tags=["Admin"])


def verify_admin_secret(
    x_admin_secret: str | None = Header(default=None, alias="X-Admin-Secret"),
):
    expected_secret = os.getenv("ADMIN_SECRET_KEY")

    if not expected_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ADMIN_SECRET_KEY is not configured",
        )

    if not x_admin_secret or x_admin_secret != expected_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin secret",
        )


@router.post("/scrape-once")
def scrape_once(
    source: str = Query("arbeitnow"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_secret),
):
    try:
        return manual_scrape_once(
            db=db,
            source=source,
            limit=limit,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Manual scrape failed: {str(e)}",
        )