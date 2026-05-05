import os

import psycopg2
from fastapi import APIRouter, File, Query, UploadFile

from services.analytics_service import (
    analyze_resume_text,
    calculate_skill_gap,
    extract_text_from_pdf,
    get_dashboard_data,
    get_market_skills,
)


router = APIRouter(prefix="/analytics", tags=["Analytics"])


def get_db_connection():
    """
    Create a raw psycopg2 database connection for analytics queries.

    Local Docker fallback:
        postgresql://postgres:postgres@postgres:5432/jobs_db

    Production:
        Uses DATABASE_URL from Render/Neon.
    """
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@postgres:5432/jobs_db",
    )

    return psycopg2.connect(database_url)


@router.get("/dashboard")
def dashboard(
    limit: int = Query(10, ge=1, le=100),
    skill: str | None = None,
    date: str | None = None,
    range_filter: str | None = Query(None, alias="range"),
):
    conn = get_db_connection()

    try:
        with conn.cursor() as cursor:
            return get_dashboard_data(
                cursor=cursor,
                limit=limit,
                skill=skill,
                date=date,
                range_filter=range_filter,
            )

    finally:
        conn.close()


@router.get("/top-skills")
def top_skills(
    limit: int = Query(30, ge=1, le=100),
):
    conn = get_db_connection()

    try:
        with conn.cursor() as cursor:
            return get_market_skills(
                cursor=cursor,
                limit=limit,
            )

    finally:
        conn.close()


@router.post("/skill-gap")
def skill_gap(user_skills: list[str]):
    conn = get_db_connection()

    try:
        with conn.cursor() as cursor:
            market = get_market_skills(cursor=cursor, limit=30)

        return calculate_skill_gap(
            user_skills=user_skills,
            market=market,
        )

    finally:
        conn.close()


@router.post("/resume-analyze")
async def resume_analyze(file: UploadFile = File(...)):
    conn = get_db_connection()

    try:
        text = extract_text_from_pdf(file.file)

        with conn.cursor() as cursor:
            market = get_market_skills(cursor=cursor, limit=30)

        return analyze_resume_text(
            text=text,
            market=market,
        )

    finally:
        conn.close()