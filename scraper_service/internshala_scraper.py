import hashlib
import time

import requests
from bs4 import BeautifulSoup

from redis_queue import send_job_to_queue


URL = "https://internshala.com/internships/computer-science-internship/"
SLEEP_SECONDS = 300


def clean_text(value, default=""):
    if not value:
        return default

    return str(value).strip()


def fallback_url(title: str, company: str) -> str:
    raw = f"{title.lower()}-{company.lower()}"
    return "internshala-" + hashlib.sha256(raw.encode()).hexdigest()


def build_headers():
    return {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0 Safari/537.36"
        )
    }


def build_source_url(title_element, title: str, company: str) -> str:
    if title_element and title_element.has_attr("href"):
        href = clean_text(title_element.get("href"))

        if href.startswith("http"):
            return href

        return f"https://internshala.com{href}"

    return fallback_url(title, company)


def build_job_payload(card):
    title_element = card.select_one(".job-title-href")
    company_element = card.select_one(".company-name")
    location_element = card.select_one(".location_link")

    if not title_element:
        return None, "missing title"

    if not company_element:
        return None, "missing company"

    title = clean_text(title_element.get_text())
    company = clean_text(company_element.get_text(), "Unknown")
    location = clean_text(
        location_element.get_text() if location_element else None,
        "India",
    )

    if not title:
        return None, "empty title"

    if not company:
        return None, "empty company"

    source_url = build_source_url(
        title_element=title_element,
        title=title,
        company=company,
    )

    payload = {
        "title": title,
        "company": company,
        "location": location,
        "description": "Internship from Internshala",
        "source": "internshala",
        "source_url": source_url,
        "job_type": "internship",
        "experience_level": "junior",
        "salary_min": None,
        "salary_max": None,
        "currency": "INR",
    }

    return payload, None


def fetch_cards():
    response = requests.get(
        URL,
        headers=build_headers(),
        timeout=15,
    )
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    return soup.select(".individual_internship")


def scrape_internshala_jobs():
    try:
        print("🌐 Fetching Internshala internships...")

        cards = fetch_cards()
        print(f"📊 Found {len(cards)} internships")

        queued_count = 0
        skipped_count = 0

        for index, card in enumerate(cards):
            try:
                job_data, error = build_job_payload(card)

                if error:
                    skipped_count += 1
                    print(f"⚠️ Skipping Internshala #{index}: {error}")
                    continue

                task_id = send_job_to_queue(job_data)

                if task_id:
                    queued_count += 1
                    print(f"✅ Queued Internshala job: {job_data['title']} | {task_id}")
                else:
                    skipped_count += 1
                    print(f"⚠️ Skipped invalid payload: {job_data['title']}")

            except Exception as job_error:
                skipped_count += 1
                print(f"❌ Error processing Internshala #{index}: {job_error}")

        print(
            f"✅ Internshala cycle done | Queued: {queued_count} | Skipped: {skipped_count}"
        )

    except Exception as scraper_error:
        print(f"❌ Internshala scraper failed: {scraper_error}")


if __name__ == "__main__":
    while True:
        print("\n🔁 Running Internshala scraper cycle...")
        scrape_internshala_jobs()
        print(f"😴 Sleeping {SLEEP_SECONDS}s...\n")
        time.sleep(SLEEP_SECONDS)