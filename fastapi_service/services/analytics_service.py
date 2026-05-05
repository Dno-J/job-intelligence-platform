import re
from datetime import datetime, timedelta

import pdfplumber


SKILL_ALIASES = {
    "js": "javascript",
    "nodejs": "node",
    "postgres": "postgresql",
    "psql": "postgresql",
    "py": "python",
    "docker-compose": "docker",
}

SKILL_RELATIONS = {
    "fastapi": ["python"],
    "django": ["python"],
    "flask": ["python"],
    "sqlalchemy": ["sql"],
    "sqlmodel": ["sql"],
    "mysql": ["sql"],
    "sqlite": ["sql"],
}


def normalize_text(text: str) -> str:
    text = text or ""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s\+\#\.]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def normalize_skill(skill: str) -> str:
    return (skill or "").lower().strip()


def extract_skills_from_text(text: str, market_skills: list[str]) -> list[str]:
    normalized_text = normalize_text(text)
    found_skills = set()

    for skill in market_skills:
        if re.search(rf"\b{re.escape(skill)}\b", normalized_text):
            found_skills.add(skill)

    for alias, actual in SKILL_ALIASES.items():
        if re.search(rf"\b{re.escape(alias)}\b", normalized_text):
            found_skills.add(normalize_skill(actual))

    for tech, mapped_skills in SKILL_RELATIONS.items():
        if re.search(rf"\b{re.escape(tech)}\b", normalized_text):
            for skill in mapped_skills:
                found_skills.add(normalize_skill(skill))

    return list(found_skills)


def get_range_days(range_filter: str | None) -> int:
    if range_filter == "30d":
        return 30

    if range_filter == "90d":
        return 90

    return 7


def build_analytics_filters(
    skill: str | None,
    date: str | None,
    days: int,
):
    filters = ["j.is_active = TRUE"]
    params = []

    if skill:
        filters.append("s.normalized_name = %s")
        params.append(normalize_skill(skill))

    if date:
        filters.append("DATE(j.scraped_at) = %s")
        params.append(date)

    filters.append("j.scraped_at >= NOW() - (%s * INTERVAL '1 day')")
    params.append(days)

    return " AND ".join(filters), params


def get_top_skills(cursor, where_clause: str, params: list, limit: int):
    cursor.execute(
        f"""
        SELECT s.normalized_name, COUNT(js.id)
        FROM jobs_jobskill js
        JOIN jobs_skill s ON js.skill_id = s.id
        JOIN jobs_job j ON js.job_id = j.id
        WHERE {where_clause}
        GROUP BY s.normalized_name
        ORDER BY COUNT(js.id) DESC
        LIMIT %s
        """,
        params + [limit],
    )

    return [
        {"skill": row[0], "count": row[1]}
        for row in cursor.fetchall()
    ]


def get_top_companies(cursor, where_clause: str, params: list, limit: int):
    cursor.execute(
        f"""
        SELECT c.name, COUNT(DISTINCT j.id)
        FROM jobs_job j
        JOIN jobs_company c ON j.company_id = c.id
        LEFT JOIN jobs_jobskill js ON js.job_id = j.id
        LEFT JOIN jobs_skill s ON js.skill_id = s.id
        WHERE {where_clause}
        GROUP BY c.name
        ORDER BY COUNT(DISTINCT j.id) DESC
        LIMIT %s
        """,
        params + [limit],
    )

    return [
        {"company": row[0], "jobs": row[1]}
        for row in cursor.fetchall()
    ]


def get_job_trends(cursor, where_clause: str, params: list, days: int):
    cursor.execute(
        f"""
        SELECT DATE(j.scraped_at), COUNT(DISTINCT j.id)
        FROM jobs_job j
        LEFT JOIN jobs_jobskill js ON js.job_id = j.id
        LEFT JOIN jobs_skill s ON js.skill_id = s.id
        WHERE {where_clause}
        GROUP BY DATE(j.scraped_at)
        ORDER BY DATE(j.scraped_at)
        """,
        params,
    )

    rows = cursor.fetchall()
    trend_map = {str(row[0]): row[1] for row in rows}

    today = datetime.utcnow().date()
    trends = []

    for i in range(days):
        current_date = today - timedelta(days=(days - i - 1))
        date_key = str(current_date)

        trends.append(
            {
                "date": date_key,
                "count": trend_map.get(date_key, 0),
            }
        )

    return trends


def get_dashboard_data(
    cursor,
    limit: int,
    skill: str | None,
    date: str | None,
    range_filter: str | None,
):
    days = get_range_days(range_filter)
    where_clause, params = build_analytics_filters(
        skill=skill,
        date=date,
        days=days,
    )

    return {
        "top_skills": get_top_skills(
            cursor=cursor,
            where_clause=where_clause,
            params=params,
            limit=limit,
        ),
        "top_companies": get_top_companies(
            cursor=cursor,
            where_clause=where_clause,
            params=params,
            limit=limit,
        ),
        "job_trends": get_job_trends(
            cursor=cursor,
            where_clause=where_clause,
            params=params,
            days=days,
        ),
    }


def get_market_skills(cursor, limit: int = 30):
    cursor.execute(
        """
        SELECT s.normalized_name, COUNT(js.id)
        FROM jobs_jobskill js
        JOIN jobs_skill s ON js.skill_id = s.id
        JOIN jobs_job j ON js.job_id = j.id
        WHERE j.is_active = TRUE
        GROUP BY s.normalized_name
        ORDER BY COUNT(js.id) DESC
        LIMIT %s
        """,
        (limit,),
    )

    rows = cursor.fetchall()

    return [
        {"skill": row[0], "demand": row[1]}
        for row in rows
    ]


def calculate_skill_gap(user_skills: list[str], market: list[dict]):
    user_set = {
        normalize_skill(skill)
        for skill in user_skills
        if skill and skill.strip()
    }

    matched = [
        item["skill"]
        for item in market
        if item["skill"] in user_set
    ]

    missing = [
        item
        for item in market
        if item["skill"] not in user_set
    ]

    recommended = sorted(
        missing,
        key=lambda item: item["demand"],
        reverse=True,
    )[:5]

    match_score = int((len(matched) / len(market)) * 100) if market else 0

    return {
        "match_score": match_score,
        "matched_skills": matched,
        "missing_skills": [item["skill"] for item in missing],
        "recommended_skills": recommended,
    }


def extract_text_from_pdf(file) -> str:
    text = ""

    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    return text


def analyze_resume_text(text: str, market: list[dict]):
    market_skills = [item["skill"] for item in market]
    demand_map = {
        item["skill"]: item["demand"]
        for item in market
    }

    extracted_skills = extract_skills_from_text(
        text=text,
        market_skills=market_skills,
    )

    matched = list(set(extracted_skills))
    missing = [
        skill
        for skill in market_skills
        if skill not in matched
    ]

    total = len(market_skills)
    match_score = int((len(matched) / total) * 100) if total else 0

    recommended = sorted(
        [
            {
                "skill": skill,
                "demand": demand_map[skill],
            }
            for skill in missing
        ],
        key=lambda item: item["demand"],
        reverse=True,
    )[:5]

    return {
        "match_score": match_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "recommended_skills": recommended,
    }