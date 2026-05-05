import hashlib
import re
import time

import requests
from bs4 import BeautifulSoup

from redis_queue import send_job_to_queue


URL = "https://remotive.com/api/remote-jobs"
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
    return "remotive-" + hashlib.sha256(raw.encode()).hexdigest()


def parse_salary(salary_str):
    if not salary_str:
        return None, None, "USD"

    salary_text = str(salary_str).lower().replace(",", "")

    if "€" in salary_text or "eur" in salary_text:
        currency = "EUR"
    elif "£" in salary_text or "gbp" in salary_text:
        currency = "GBP"
    elif "₹" in salary_text or "inr" in salary_text:
        currency = "INR"
    else:
        currency = "USD"

    numbers = re.findall(r"\d+(?:\.\d+)?", salary_text)

    parsed_numbers = []

    for number in numbers:
        value = float(number)

        if "k" in salary_text:
            value *= 1000

        parsed_numbers.append(int(value))

    if len(parsed_numbers) >= 2:
        return parsed_numbers[0], parsed_numbers[1], currency

    if len(parsed_numbers) == 1:
        return parsed_numbers[0], parsed_numbers[0], currency

    return None, None, currency


def infer_job_type(raw_job_type: str, title: str) -> str:
    combined_text = f"{raw_job_type or ''} {title or ''}".lower()

    if "contract" in combined_text or "freelance" in combined_text:
        return "contract"

    if "part" in combined_text:
        return "part-time"

    if "intern" in combined_text:
        return "internship"

    return "full-time"


def infer_experience(title: str) -> str:
    title_lower = title.lower()

    if any(word in title_lower for word in ["senior", "sr.", "lead", "principal", "staff", "head"]):
        return "senior"

    if any(word in title_lower for word in ["junior", "jr.", "intern", "trainee", "entry"]):
        return "junior"

    return "mid"


def build_job_payload(job: dict):
    title = clean_text(job.get("title"))
    company = clean_text(job.get("company_name"), "Unknown")
    location = clean_text(job.get("candidate_required_location"), "Remote")
    raw_description = job.get("description") or ""
    raw_job_type = clean_text(job.get("job_type"), "full-time")
    source_url = clean_text(job.get("url"))

    if not title:
        return None, "missing title"

    if not source_url:
        source_url = fallback_url(title, company)

    description = clean_html(raw_description)

    salary_min, salary_max, currency = parse_salary(job.get("salary"))

    payload = {
        "title": title,
        "company": company,
        "location": location,
        "description": description,
        "source": "remotive",
        "source_url": source_url,
        "job_type": infer_job_type(raw_job_type, title),
        "experience_level": infer_experience(title),
        "salary_min": salary_min,
        "salary_max": salary_max,
        "currency": currency,
    }

    return payload, None


def fetch_jobs():
    response = requests.get(URL, timeout=15)
    response.raise_for_status()

    data = response.json()
    return data.get("jobs", [])


def scrape_jobs():
    try:
        print("🌐 Fetching jobs from Remotive API...")

        jobs = fetch_jobs()
        print(f"📊 Found {len(jobs)} jobs")

        queued_count = 0
        skipped_count = 0

        for index, job in enumerate(jobs):
            try:
                job_data, error = build_job_payload(job)

                if error:
                    skipped_count += 1
                    print(f"⚠️ Skipping Remotive job #{index}: {error}")
                    continue

                task_id = send_job_to_queue(job_data)

                if task_id:
                    queued_count += 1
                    print(f"✅ Queued Remotive job: {job_data['title']} | {task_id}")
                else:
                    skipped_count += 1
                    print(f"⚠️ Skipped invalid payload: {job_data['title']}")

            except Exception as job_error:
                skipped_count += 1
                print(f"❌ Error processing Remotive job #{index}: {job_error}")

        print(
            f"✅ Remotive cycle done | Queued: {queued_count} | Skipped: {skipped_count}"
        )

    except Exception as scraper_error:
        print(f"❌ Remotive scraper failed: {scraper_error}")


if __name__ == "__main__":
    while True:
        print("\n🔁 Running Remotive scraper cycle...")
        scrape_jobs()
        print(f"😴 Sleeping {SLEEP_SECONDS}s...\n")
        time.sleep(SLEEP_SECONDS)