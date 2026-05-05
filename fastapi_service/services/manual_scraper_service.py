import re
from typing import Dict, List, Optional

import requests
from sqlalchemy.orm import Session

from models.job import Company, Job
from models.skill import Skill
from models.job_skill import JobSkill


ARBEITNOW_URL = "https://www.arbeitnow.com/api/job-board-api"
REMOTIVE_URL = "https://remotive.com/api/remote-jobs"


SKILL_ALIASES = {
    "js": "javascript",
    "node": "node.js",
    "nodejs": "node.js",
    "reactjs": "react",
    "nextjs": "next.js",
    "postgres": "postgresql",
    "psql": "postgresql",
    "py": "python",
    "docker-compose": "docker",
    "k8s": "kubernetes",
    "mongo": "mongodb",
    "cicd": "ci/cd",
    "ci cd": "ci/cd",
}


SKILLS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "c++",
    "c#",
    "rust",
    "php",
    "ruby",
    "swift",
    "kotlin",
    "dart",
    "html",
    "css",
    "tailwind",
    "bootstrap",
    "react",
    "next.js",
    "vue",
    "angular",
    "redux",
    "node.js",
    "express",
    "django",
    "fastapi",
    "flask",
    "spring",
    "spring boot",
    "rest api",
    "graphql",
    "microservices",
    "sql",
    "postgresql",
    "mysql",
    "sqlite",
    "mongodb",
    "redis",
    "elasticsearch",
    "sqlalchemy",
    "pandas",
    "numpy",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "terraform",
    "jenkins",
    "github actions",
    "ci/cd",
    "nginx",
    "linux",
    "pytest",
    "selenium",
    "playwright",
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "nlp",
    "llm",
    "langchain",
    "langgraph",
    "openai",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "git",
    "github",
    "postman",
    "jira",
    "figma",
    "excel",
    "power bi",
    "tableau",
    "android",
    "ios",
    "react native",
    "flutter",
    "agile",
    "scrum",
    "data structures",
    "algorithms",
    "system design",
]


CONTEXTUAL_SKILLS = {
    "go": {
        "final": "go",
        "contexts": [
            "golang",
            "go developer",
            "go engineer",
            "go backend",
            "go programming",
            "go language",
            "written in go",
            "experience with go",
        ],
    },
    "ai": {
        "final": "artificial intelligence",
        "contexts": [
            "artificial intelligence",
            "ai engineer",
            "ai developer",
            "ai tools",
            "ai systems",
            "ai models",
            "ai/ml",
            "generative ai",
        ],
    },
    "ml": {
        "final": "machine learning",
        "contexts": [
            "machine learning",
            "ml engineer",
            "ml models",
            "ml pipelines",
            "ai/ml",
        ],
    },
    "api": {
        "final": "api",
        "contexts": [
            "rest api",
            "apis",
            "api development",
            "api integration",
            "api design",
            "build apis",
            "building apis",
            "develop apis",
            "developing apis",
        ],
    },
}


def clean_text(value: Optional[str], default: str = "") -> str:
    if not value:
        return default

    value = str(value)
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value)

    return value.strip()


def infer_job_type(title: str) -> str:
    title_lower = title.lower()

    if "intern" in title_lower:
        return "internship"

    if "contract" in title_lower:
        return "contract"

    if "part" in title_lower:
        return "part-time"

    return "full-time"


def infer_experience(title: str) -> str:
    title_lower = title.lower()

    if "senior" in title_lower or "lead" in title_lower or "principal" in title_lower:
        return "senior"

    if "junior" in title_lower or "entry" in title_lower or "intern" in title_lower:
        return "junior"

    return "mid"


def normalize_text(text: str) -> str:
    text = text or ""
    text = text.lower()

    text = text.replace("node.js", "nodejs")
    text = text.replace("next.js", "nextjs")
    text = text.replace("c++", "cplusplus")
    text = text.replace("c#", "csharp")
    text = text.replace("ci/cd", "cicd")
    text = text.replace("ai/ml", "ai ml")

    text = re.sub(r"[^a-z0-9\s\+\#\.\/-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def normalize_skill(skill: str) -> str:
    skill = (skill or "").lower().strip()

    normalized = SKILL_ALIASES.get(skill, skill)

    if normalized == "cplusplus":
        return "c++"

    if normalized == "csharp":
        return "c#"

    if normalized == "cicd":
        return "ci/cd"

    return normalized


def prepare_search_key(skill: str) -> str:
    key = skill.lower().strip()

    key = key.replace("node.js", "nodejs")
    key = key.replace("next.js", "nextjs")
    key = key.replace("c++", "cplusplus")
    key = key.replace("c#", "csharp")
    key = key.replace("ci/cd", "cicd")

    return key


def build_skill_pattern(skill: str) -> str:
    escaped = re.escape(skill)

    escaped = escaped.replace("nodejs", r"node\.?js")
    escaped = escaped.replace("nextjs", r"next\.?js")
    escaped = escaped.replace("cplusplus", r"c\+\+")
    escaped = escaped.replace("csharp", r"c#")
    escaped = escaped.replace("cicd", r"ci\/?cd")

    return rf"(?<![a-z0-9]){escaped}(?![a-z0-9])"


def phrase_exists(normalized_text_value: str, phrase: str) -> bool:
    phrase_key = prepare_search_key(phrase)
    pattern = build_skill_pattern(phrase_key)

    return bool(re.search(pattern, normalized_text_value))


def extract_skills(text: str) -> List[str]:
    if not text:
        return []

    normalized_text_value = normalize_text(text)
    found_skills = set()

    for skill in SKILLS:
        search_key = prepare_search_key(skill)
        pattern = build_skill_pattern(search_key)

        if re.search(pattern, normalized_text_value):
            found_skills.add(normalize_skill(skill))

    for alias, actual in SKILL_ALIASES.items():
        alias_key = prepare_search_key(alias)
        pattern = build_skill_pattern(alias_key)

        if re.search(pattern, normalized_text_value):
            found_skills.add(normalize_skill(actual))

    for config in CONTEXTUAL_SKILLS.values():
        if any(
            phrase_exists(normalized_text_value, context)
            for context in config["contexts"]
        ):
            found_skills.add(config["final"])

    return sorted(found_skills)


def get_or_create_company(
    db: Session,
    name: str,
) -> Company:
    company_name = clean_text(name, "Unknown")

    company = (
        db.query(Company)
        .filter(Company.name == company_name)
        .first()
    )

    if company:
        return company

    company = Company(name=company_name)

    db.add(company)
    db.flush()

    return company


def get_or_create_skill(
    db: Session,
    skill_name: str,
) -> Skill:
    normalized = normalize_skill(skill_name)

    skill = (
        db.query(Skill)
        .filter(Skill.normalized_name == normalized)
        .first()
    )

    if skill:
        return skill

    skill = Skill(
        name=skill_name,
        normalized_name=normalized,
    )

    db.add(skill)
    db.flush()

    return skill


def link_job_skill(
    db: Session,
    job_id,
    skill_id,
) -> bool:
    existing = (
        db.query(JobSkill)
        .filter(
            JobSkill.job_id == job_id,
            JobSkill.skill_id == skill_id,
        )
        .first()
    )

    if existing:
        return False

    job_skill = JobSkill(
        job_id=job_id,
        skill_id=skill_id,
    )

    db.add(job_skill)

    return True


def create_job_with_skills(
    db: Session,
    *,
    title: str,
    company_name: str,
    location: str,
    description: str,
    source: str,
    source_url: str,
    job_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    salary_min: Optional[int] = None,
    salary_max: Optional[int] = None,
    currency: str = "USD",
) -> Dict:
    if not title or not source_url:
        return {
            "inserted": False,
            "skipped": True,
            "skills_linked": 0,
        }

    existing_job = (
        db.query(Job)
        .filter(Job.source_url == source_url)
        .first()
    )

    if existing_job:
        return {
            "inserted": False,
            "skipped": True,
            "skills_linked": 0,
        }

    company = get_or_create_company(
        db=db,
        name=company_name,
    )

    job = Job(
        title=title,
        company_id=company.id,
        location=location,
        description=description,
        source=source,
        source_url=source_url,
        job_type=job_type or infer_job_type(title),
        experience_level=experience_level or infer_experience(title),
        salary_min=salary_min,
        salary_max=salary_max,
        currency=currency,
        is_active=True,
    )

    db.add(job)
    db.flush()

    skills_linked = 0
    extracted_skills = extract_skills(f"{title} {description}")

    for skill_name in extracted_skills:
        skill = get_or_create_skill(
            db=db,
            skill_name=skill_name,
        )

        created_link = link_job_skill(
            db=db,
            job_id=job.id,
            skill_id=skill.id,
        )

        if created_link:
            skills_linked += 1

    return {
        "inserted": True,
        "skipped": False,
        "skills_linked": skills_linked,
    }


def fetch_arbeitnow_jobs(limit: int = 50) -> List[Dict]:
    response = requests.get(
        ARBEITNOW_URL,
        timeout=20,
        headers={
            "User-Agent": "JobIntel/1.0",
            "Accept": "application/json",
        },
    )
    response.raise_for_status()

    data = response.json()
    jobs = data.get("data", [])

    return jobs[:limit]


def scrape_arbeitnow_once(
    db: Session,
    limit: int = 50,
) -> Dict:
    jobs = fetch_arbeitnow_jobs(limit=limit)

    jobs_seen = 0
    jobs_inserted = 0
    jobs_skipped = 0
    skills_linked = 0

    for item in jobs:
        jobs_seen += 1

        result = create_job_with_skills(
            db=db,
            title=clean_text(item.get("title")),
            company_name=clean_text(item.get("company_name"), "Unknown"),
            location=clean_text(item.get("location"), "Remote"),
            description=clean_text(item.get("description")),
            source="arbeitnow",
            source_url=clean_text(item.get("url")),
            job_type=None,
            experience_level=None,
            salary_min=None,
            salary_max=None,
            currency="USD",
        )

        if result["inserted"]:
            jobs_inserted += 1

        if result["skipped"]:
            jobs_skipped += 1

        skills_linked += result["skills_linked"]

    db.commit()

    return {
        "message": "Manual scrape completed",
        "source": "arbeitnow",
        "jobs_seen": jobs_seen,
        "jobs_inserted": jobs_inserted,
        "jobs_skipped": jobs_skipped,
        "skills_linked": skills_linked,
    }


def fetch_remotive_jobs(limit: int = 50) -> List[Dict]:
    response = requests.get(
        REMOTIVE_URL,
        timeout=20,
        headers={
            "User-Agent": "JobIntel/1.0",
            "Accept": "application/json",
        },
    )
    response.raise_for_status()

    data = response.json()
    jobs = data.get("jobs", [])

    return jobs[:limit]


def parse_salary(value) -> tuple[Optional[int], Optional[int], str]:
    if not value:
        return None, None, "USD"

    text = str(value)
    currency = "USD"

    if "€" in text or "eur" in text.lower():
        currency = "EUR"
    elif "£" in text or "gbp" in text.lower():
        currency = "GBP"
    elif "$" in text or "usd" in text.lower():
        currency = "USD"

    numbers = [
        int(num.replace(",", ""))
        for num in re.findall(r"\d[\d,]*", text)
    ]

    if len(numbers) >= 2:
        return numbers[0], numbers[1], currency

    if len(numbers) == 1:
        return numbers[0], None, currency

    return None, None, currency


def scrape_remotive_once(
    db: Session,
    limit: int = 50,
) -> Dict:
    jobs = fetch_remotive_jobs(limit=limit)

    jobs_seen = 0
    jobs_inserted = 0
    jobs_skipped = 0
    skills_linked = 0

    for item in jobs:
        jobs_seen += 1

        salary_min, salary_max, currency = parse_salary(item.get("salary"))

        title = clean_text(item.get("title"))
        company_name = clean_text(item.get("company_name"), "Unknown")
        location = clean_text(
            item.get("candidate_required_location"),
            "Remote",
        )
        description = clean_text(item.get("description"))
        source_url = clean_text(item.get("url"))

        result = create_job_with_skills(
            db=db,
            title=title,
            company_name=company_name,
            location=location,
            description=description,
            source="remotive",
            source_url=source_url,
            job_type="full-time",
            experience_level=infer_experience(title),
            salary_min=salary_min,
            salary_max=salary_max,
            currency=currency,
        )

        if result["inserted"]:
            jobs_inserted += 1

        if result["skipped"]:
            jobs_skipped += 1

        skills_linked += result["skills_linked"]

    db.commit()

    return {
        "message": "Manual scrape completed",
        "source": "remotive",
        "jobs_seen": jobs_seen,
        "jobs_inserted": jobs_inserted,
        "jobs_skipped": jobs_skipped,
        "skills_linked": skills_linked,
    }


def manual_scrape_once(
    db: Session,
    source: str = "remotive",
    limit: int = 50,
) -> Dict:
    source = source.lower().strip()

    if source == "remotive":
        return scrape_remotive_once(
            db=db,
            limit=limit,
        )

    if source == "arbeitnow":
        return scrape_arbeitnow_once(
            db=db,
            limit=limit,
        )

    raise ValueError("Supported manual scrape sources: 'remotive', 'arbeitnow'.")
