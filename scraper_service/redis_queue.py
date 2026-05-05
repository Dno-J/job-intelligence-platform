from celery import Celery


celery = Celery(
    "scraper",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0",
)

celery.conf.task_default_queue = "celery"


REQUIRED_FIELDS = [
    "title",
    "company",
    "source",
    "source_url",
]


def validate_job_data(job_data: dict) -> bool:
    for field in REQUIRED_FIELDS:
        value = job_data.get(field)

        if not value or not str(value).strip():
            return False

    return True


def normalize_job_data(job_data: dict) -> dict:
    return {
        "title": str(job_data.get("title", "")).strip(),
        "company": str(job_data.get("company", "Unknown")).strip() or "Unknown",
        "location": str(job_data.get("location", "Remote")).strip() or "Remote",
        "description": str(job_data.get("description", "")).strip(),
        "source": str(job_data.get("source", "unknown")).strip().lower(),
        "source_url": str(job_data.get("source_url", "")).strip(),
        "job_type": str(job_data.get("job_type", "full-time")).strip().lower(),
        "experience_level": str(job_data.get("experience_level", "mid")).strip().lower(),
        "salary_min": job_data.get("salary_min"),
        "salary_max": job_data.get("salary_max"),
        "currency": str(job_data.get("currency", "USD")).strip().upper() or "USD",
    }


def send_job_to_queue(job_data: dict):
    normalized_job = normalize_job_data(job_data)

    if not validate_job_data(normalized_job):
        print("Skipping invalid job payload")
        return None

    result = celery.send_task(
        "process_job_task",
        args=[normalized_job],
        queue="celery",
    )

    return result.id