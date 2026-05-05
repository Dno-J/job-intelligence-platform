import psycopg2

from celery import shared_task
from skill_extractor import extract_skills


def normalize_skill(skill: str) -> str:
    return (skill or "").lower().strip()


@shared_task(name="backfill_job_skills")
def backfill_job_skills(batch_size: int = 1000, clean_rebuild: bool = False):
    conn = None
    cursor = None

    total_jobs_scanned = 0
    total_skills_linked = 0
    total_jobs_with_skills = 0

    try:
        conn = psycopg2.connect(
            dbname="jobs_db",
            user="postgres",
            password="postgres",
            host="postgres",
            port=5432,
        )

        cursor = conn.cursor()

        print("🔁 Starting skill backfill...")

        if clean_rebuild:
            print("🧹 Clean rebuild enabled: clearing existing job-skill links...")
            cursor.execute("DELETE FROM jobs_jobskill;")

        cursor.execute(
            """
            SELECT id, title, description
            FROM jobs_job
            WHERE is_active = TRUE
            ORDER BY scraped_at DESC
            LIMIT %s
            """,
            (batch_size,),
        )

        jobs = cursor.fetchall()

        print(f"📊 Found {len(jobs)} active jobs to scan")

        for job_id, title, description in jobs:
            total_jobs_scanned += 1

            combined_text = f"{title or ''} {description or ''}"
            extracted_skills = extract_skills(combined_text)

            if not extracted_skills:
                continue

            total_jobs_with_skills += 1

            for skill_name in extracted_skills:
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
                    ON CONFLICT DO NOTHING;
                    """,
                    (job_id, skill_id),
                )

                if cursor.rowcount > 0:
                    total_skills_linked += 1

        # Remove skills that are no longer linked to any job
        cursor.execute(
            """
            DELETE FROM jobs_skill s
            WHERE NOT EXISTS (
                SELECT 1
                FROM jobs_jobskill js
                WHERE js.skill_id = s.id
            );
            """
        )

        unused_skills_deleted = cursor.rowcount

        conn.commit()

        print(
            "✅ Skill backfill complete | "
            f"Jobs scanned: {total_jobs_scanned}, "
            f"Jobs with skills: {total_jobs_with_skills}, "
            f"New links created: {total_skills_linked}, "
            f"Unused skills deleted: {unused_skills_deleted}"
        )

        return {
            "jobs_scanned": total_jobs_scanned,
            "jobs_with_skills": total_jobs_with_skills,
            "new_links_created": total_skills_linked,
            "unused_skills_deleted": unused_skills_deleted,
        }

    except Exception as e:
        print(f"❌ Skill backfill failed: {e}")

        if conn:
            conn.rollback()

        raise

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()