import hashlib
import time

import requests
from bs4 import BeautifulSoup

from redis_queue import send_job_to_queue


URL = "https://remoteok.com/api"
SLEEP_SECONDS = 120


def clean_text(value, default=""):
    if not value:
        return default

    return str(value).strip()


def clean_html(text: str) -> str:
    return BeautifulSoup(
        text or "",
        "html.parser",
    ).get_text(separator=" ", strip=True)


def fallback_url(title: str, company: str) -> str:
    raw = f"{title.lower()}-{company.lower()}"
    return "remoteok-" + hashlib.sha256(raw.encode()).hexdigest()


def normalize_remoteok_url(url: str, title: str, company: str) -> str:
    url = clean_text(url)

    if not url:
        return fallback_url(title, company)

    if url.startswith("http"):
        return url

    if url.startswith("/"):
        return f"https://remoteok.com{url}"

    return f"https://remoteok.com/{url}"


def parse_salary(job: dict):
    salary_min = job.get("salary_min")
    salary_max = job.get("salary_max")

    try:
        salary_min = int(salary_min) if salary_min else None
        salary_max = int(salary_max) if salary_max else None
    except (TypeError, ValueError):
        return None, None, "USD"

    if salary_min and salary_max:
        return salary_min, salary_max, "USD"

    if salary_min:
        return salary_min, salary_min, "USD"

    if salary_max:
        return salary_max, salary_max, "USD"

    return None, None, "USD"


def infer_job_type(tags, title: str) -> str:
    tags_text = " ".join(tags or [])
    combined_text = f"{tags_text} {title or ''}".lower()

    if "intern" in combined_text:
        return "internship"

    if "contract" in combined_text or "freelance" in combined_text:
        return "contract"

    if "part" in combined_text:
        return "part-time"

    return "full-time"


def infer_experience(title: str) -> str:
    title_lower = title.lower()

    if any(word in title_lower for word in ["senior", "sr.", "lead", "principal", "staff", "head"]):
        return "senior"

    if any(word in title_lower for word in ["junior", "jr.", "intern", "trainee", "entry"]):
        return "junior"

    return "mid"


def is_valid_remoteok_job(job: dict) -> bool:
    if not isinstance(job, dict):
        return False

    if not job.get("position"):
        return False

    # RemoteOK sometimes includes test/spam listings.
    title = str(job.get("position", "")).lower()

    if title.strip() == "test job":
        return False

    return True


def build_headers():
    return {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0 Safari/537.36"
        )
    }


def build_job_payload(job: dict):
    if not is_valid_remoteok_job(job):
        return None, "invalid or test job"

    title = clean_text(job.get("position"))
    company = clean_text(job.get("company"), "Unknown")
    location = clean_text(job.get("location"), "Remote")
    raw_description = job.get("description") or ""
    tags = job.get("tags", [])

    source_url = normalize_remoteok_url(
        url=job.get("url"),
        title=title,
        company=company,
    )

    description = clean_html(raw_description)

    salary_min, salary_max, currency = parse_salary(job)

    payload = {
        "title": title,
        "company": company,
        "location": location,
        "description": description,
        "source": "remoteok",
        "source_url": source_url,
        "job_type": infer_job_type(tags, title),
        "experience_level": infer_experience(title),
        "salary_min": salary_min,
        "salary_max": salary_max,
        "currency": currency,
    }

    return payload, None


def fetch_jobs():
    response = requests.get(
        URL,
        headers=build_headers(),
        timeout=15,
    )
    response.raise_for_status()

    data = response.json()

    # First item is metadata in RemoteOK response.
    return data[1:] if isinstance(data, list) else []


def scrape_jobs():
    try:
        print("🌐 Fetching jobs from RemoteOK API...")

        jobs = fetch_jobs()
        print(f"📊 Found {len(jobs)} jobs")

        queued_count = 0
        skipped_count = 0

        for index, job in enumerate(jobs):
            try:
                job_data, error = build_job_payload(job)

                if error:
                    skipped_count += 1
                    print(f"⚠️ Skipping RemoteOK job #{index}: {error}")
                    continue

                task_id = send_job_to_queue(job_data)

                if task_id:
                    queued_count += 1
                    print(f"✅ Queued RemoteOK job: {job_data['title']} | {task_id}")
                else:
                    skipped_count += 1
                    print(f"⚠️ Skipped invalid payload: {job_data['title']}")

            except Exception as job_error:
                skipped_count += 1
                print(f"❌ Error processing RemoteOK job #{index}: {job_error}")

        print(
            f"✅ RemoteOK cycle done | Queued: {queued_count} | Skipped: {skipped_count}"
        )

    except Exception as scraper_error:
        print(f"❌ RemoteOK scraper failed: {scraper_error}")


if __name__ == "__main__":
    while True:
        print("\n🔁 Running RemoteOK scraper cycle...")
        scrape_jobs()
        print(f"😴 Sleeping {SLEEP_SECONDS}s...\n")
        time.sleep(SLEEP_SECONDS)