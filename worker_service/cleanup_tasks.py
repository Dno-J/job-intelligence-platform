from celery import shared_task
import psycopg2
from datetime import datetime, timedelta, timezone


@shared_task(name="cleanup_old_jobs")
def cleanup_old_jobs():
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

        now = datetime.now(timezone.utc)

        # Conservative cleanup settings
        INACTIVE_DAYS = 30
        DELETE_DAYS = 90

        inactive_threshold = now - timedelta(days=INACTIVE_DAYS)
        delete_threshold = now - timedelta(days=DELETE_DAYS)

        # Mark old jobs inactive
        cursor.execute(
            """
            UPDATE jobs_job
            SET is_active = FALSE
            WHERE scraped_at < %s
            AND is_active = TRUE
            """,
            (inactive_threshold,),
        )

        jobs_marked_inactive = cursor.rowcount

        # Delete very old inactive jobs
        cursor.execute(
            """
            DELETE FROM jobs_job
            WHERE scraped_at < %s
            AND is_active = FALSE
            """,
            (delete_threshold,),
        )

        jobs_deleted = cursor.rowcount

        # Log cleanup
        cursor.execute(
            """
            INSERT INTO jobs_cleanuplog (
                id,
                run_at,
                jobs_marked_inactive,
                jobs_deleted
            )
            VALUES (gen_random_uuid(), %s, %s, %s)
            """,
            (now, jobs_marked_inactive, jobs_deleted),
        )

        conn.commit()

        print(
            f"🧹 Cleanup done | "
            f"Inactive: {jobs_marked_inactive}, "
            f"Deleted: {jobs_deleted}"
        )

    except Exception as e:
        print(f"❌ Cleanup failed: {e}")

        if conn:
            conn.rollback()

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()