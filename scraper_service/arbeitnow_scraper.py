import time

import requests

from redis_queue import send_job_to_queue


URL = "https://www.arbeitnow.com/api/job-board-api"
SLEEP_SECONDS = 120
MAX_JOBS_PER_CYCLE = 50


def clean_text(value, default=""):
    if not value:
        return default

    return str(value).strip()


def infer_job_type(title: str) -> str:
    title_lower = title.lower()

    if "intern" in title_lower:
        return "internship"

    if "contract" in title_lower or "freelance" in title_lower:
        return "contract"

    if "part" in title_lower or "teilzeit" in title_lower:
        return "part-time"

    return "full-time"


def infer_experience(title: str) -> str:
    title_lower = title.lower()

    if any(word in title_lower for word in ["senior", "sr.", "lead", "principal", "staff", "head"]):
        return "senior"

    if any(word in title_lower for word in ["junior", "jr.", "trainee", "intern", "entry"]):
        return "junior"

    return "mid"


def build_job_payload(job: dict):
    title = clean_text(job.get("title"))
    company = clean_text(job.get("company_name"), "Unknown")
    location = clean_text(job.get("location"), "Remote")
    description = clean_text(job.get("description"))
    source_url = clean_text(job.get("url"))

    if not title:
        return None, "missing title"

    if not source_url:
        return None, "missing source_url"

    payload = {
        "title": title,
        "company": company,
        "location": location,
        "description": description,
        "source": "arbeitnow",
        "source_url": source_url,
        "job_type": infer_job_type(title),
        "experience_level": infer_experience(title),
        "salary_min": None,
        "salary_max": None,
        "currency": "USD",
    }

    return payload, None


def fetch_jobs():
    response = requests.get(URL, timeout=15)
    response.raise_for_status()

    data = response.json()
    return data.get("data", [])


def scrape_jobs():
    try:
        print("🌐 Fetching jobs from Arbeitnow API...")

        jobs = fetch_jobs()
        print(f"📊 Found {len(jobs)} jobs")

        queued_count = 0
        skipped_count = 0

        for index, job in enumerate(jobs[:MAX_JOBS_PER_CYCLE]):
            try:
                job_data, error = build_job_payload(job)

                if error:
                    skipped_count += 1
                    print(f"⚠️ Skipping job #{index}: {error}")
                    continue

                task_id = send_job_to_queue(job_data)

                if task_id:
                    queued_count += 1
                    print(f"✅ Queued Arbeitnow job: {job_data['title']} | {task_id}")
                else:
                    skipped_count += 1
                    print(f"⚠️ Skipped invalid payload: {job_data['title']}")

            except Exception as job_error:
                skipped_count += 1
                print(f"❌ Error processing Arbeitnow job #{index}: {job_error}")

        print(
            f"✅ Arbeitnow cycle done | Queued: {queued_count} | Skipped: {skipped_count}"
        )

    except Exception as scraper_error:
        print(f"❌ Arbeitnow scraper failed: {scraper_error}")


if __name__ == "__main__":
    while True:
        print("\n🔁 Running Arbeitnow scraper cycle...")
        scrape_jobs()
        print(f"😴 Sleeping {SLEEP_SECONDS}s...\n")
        time.sleep(SLEEP_SECONDS)