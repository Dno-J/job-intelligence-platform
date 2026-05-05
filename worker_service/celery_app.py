from celery import Celery
import psycopg2
import uuid
from bs4 import BeautifulSoup
from skill_extractor import extract_skills
import re


# =========================================================
# INITIALIZE CELERY
# =========================================================
celery_app = Celery(
    "worker",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0",
)


# =========================================================
# CELERY CONFIG
# =========================================================
celery_app.conf.update(
    task_default_queue="celery",
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,

    # Safer worker behavior
    # - task_acks_late=True means a task is acknowledged only after it finishes
    # - worker_prefetch_multiplier=1 prevents one worker from grabbing too many jobs
    task_acks_late=True,
    worker_prefetch_multiplier=1,

    # Cleanup should NOT run every minute.
    # Hourly is enough and much safer.
    beat_schedule={
        "cleanup-old-jobs-hourly": {
            "task": "cleanup_old_jobs",
            "schedule": 60 * 60,
        },
    },
)


celery_app.autodiscover_tasks()
import cleanup_tasks
import cleanup_tasks
import backfill_skills

# =========================================================
# HELPERS
# =========================================================
def normalize_skill(skill: str) -> str:
    skill = (skill or "").lower()
    skill = re.sub(r"[^a-z0-9\s\+\#\.]", " ", skill)
    skill = re.sub(r"\s+", " ", skill).strip()
    return skill


def clean_text(value, default=""):
    if value is None:
        return default

    return str(value).strip()


def clean_description(raw_description: str) -> str:
    return BeautifulSoup(
        raw_description or "",
        "html.parser",
    ).get_text(separator=" ", strip=True)


# =========================================================
# MAIN TASK
# =========================================================
@celery_app.task(
    name="process_job_task",
    autoretry_for=(psycopg2.OperationalError, psycopg2.InterfaceError),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def process_job(job_data):
    conn = None
    cursor = None

    try:
        conn = psycopg2.connect(
            dbname="jobs_db",
            user="postgres",
            password="postgres",
            host="postgres",
            port=5432,
        )
        cursor = conn.cursor()

        # =========================================================
        # BASIC DATA
        # =========================================================
        title = clean_text(job_data.get("title"))
        company_name = clean_text(job_data.get("company"), "Unknown") or "Unknown"

        if not title:
            print("⚠️ Skipping job with no title")
            return

        source = clean_text(job_data.get("source"), "unknown").lower()
        source_url = clean_text(job_data.get("source_url"))

        if not source_url:
            source_url = f"{source}-{title}-{company_name}-{uuid.uuid4()}"

        # =========================================================
        # CLEAN DESCRIPTION
        # =========================================================
        description = clean_description(job_data.get("description", ""))

        # =========================================================
        # NORMALIZED JOB FIELDS
        # =========================================================
        location = clean_text(job_data.get("location"), "Remote") or "Remote"
        currency = clean_text(job_data.get("currency"), "USD").upper() or "USD"
        job_type = clean_text(job_data.get("job_type"), "full-time").lower()
        experience_level = clean_text(
            job_data.get("experience_level"),
            "mid",
        ).lower()

        salary_min = job_data.get("salary_min")
        salary_max = job_data.get("salary_max")

        # =========================================================
        # UPSERT COMPANY
        # =========================================================
        cursor.execute(
            """
            INSERT INTO jobs_company (id, name, created_at, updated_at)
            VALUES (gen_random_uuid(), %s, NOW(), NOW())
            ON CONFLICT (name)
            DO UPDATE SET updated_at = NOW()
            RETURNING id;
            """,
            (company_name,),
        )

        company_id = cursor.fetchone()[0]

        # =========================================================
        # UPSERT JOB
        # =========================================================
        cursor.execute(
            """
            INSERT INTO jobs_job (
                id,
                title,
                location,
                currency,
                description,
                source,
                source_url,
                scraped_at,
                is_active,
                company_id,
                salary_min,
                salary_max,
                job_type,
                experience_level
            )
            VALUES (
                gen_random_uuid(),
                %s, %s, %s, %s, %s, %s,
                NOW(), TRUE, %s, %s, %s, %s, %s
            )
            ON CONFLICT (source_url)
            DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                location = EXCLUDED.location,
                salary_min = EXCLUDED.salary_min,
                salary_max = EXCLUDED.salary_max,
                currency = EXCLUDED.currency,
                job_type = EXCLUDED.job_type,
                experience_level = EXCLUDED.experience_level,
                source = EXCLUDED.source,
                company_id = EXCLUDED.company_id,
                is_active = TRUE,
                scraped_at = NOW(),
                updated_at = NOW()
            RETURNING id;
            """,
            (
                title,
                location,
                currency,
                description,
                source,
                source_url,
                company_id,
                salary_min,
                salary_max,
                job_type,
                experience_level,
            ),
        )

        job_id = cursor.fetchone()[0]

        # =========================================================
        # SKILL EXTRACTION + JOB-SKILL LINKING
        # =========================================================
        try:
            skills = extract_skills(description)

            for skill_name in skills:
                normalized = normalize_skill(skill_name)

                if not normalized:
                    continue

                cursor.execute(
                    """
                    INSERT INTO jobs_skill (name, normalized_name)
                    VALUES (%s, %s)
                    ON CONFLICT (normalized_name)
                    DO UPDATE SET name = EXCLUDED.name
                    RETURNING id;
                    """,
                    (skill_name, normalized),
                )

                skill_id = cursor.fetchone()[0]

                cursor.execute(
                    """
                    INSERT INTO jobs_jobskill (job_id, skill_id)
                    VALUES (%s, %s)
                    ON CONFLICT (job_id, skill_id) DO NOTHING;
                    """,
                    (job_id, skill_id),
                )

        except Exception as skill_error:
            print(f"⚠️ Skill extraction failed for job '{title}': {skill_error}")

        # =========================================================
        # COMMIT
        # =========================================================
        conn.commit()

        print(f"✅ Job processed: {title}")

    except Exception as error:
        print(f"❌ Error saving job: {error}")

        if conn:
            conn.rollback()

        raise

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()