from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc

from models.job import Job
from models.profile import Profile
from models.job_skill import JobSkill
from models.skill import Skill


def normalize_text(value: str) -> str:
    if not value:
        return ""

    return value.strip().lower()


def get_job_skill_names(db: Session, job_id):
    rows = (
        db.query(Skill.normalized_name)
        .join(JobSkill, JobSkill.skill_id == Skill.id)
        .filter(JobSkill.job_id == job_id)
        .all()
    )

    return {row.normalized_name for row in rows if row.normalized_name}


def score_job(job: Job, profile: Profile, job_skills: set):
    score = 0
    reasons = []

    profile_skills = {
        normalize_text(skill)
        for skill in (profile.skills or [])
        if normalize_text(skill)
    }

    target_role = normalize_text(profile.target_role)
    preferred_location = normalize_text(profile.preferred_location)
    preferred_job_type = normalize_text(profile.preferred_job_type)
    experience_level = normalize_text(profile.experience_level)

    job_title = normalize_text(job.title)
    job_description = normalize_text(job.description)
    job_location = normalize_text(job.location)
    job_type = normalize_text(job.job_type)
    job_experience = normalize_text(job.experience_level)

    # Skill overlap
    matched_skills = profile_skills.intersection(job_skills)

    if matched_skills:
      skill_score = len(matched_skills) * 20
      score += skill_score
      reasons.append(
          f"Matches skills: {', '.join(sorted(matched_skills))}"
      )

    # Target role match
    if target_role and (
        target_role in job_title or target_role in job_description
    ):
        score += 30
        reasons.append("Matches your target role")

    # Preferred location match
    if preferred_location and preferred_location in job_location:
        score += 20
        reasons.append("Matches your preferred location")

    # Preferred job type match
    if preferred_job_type and preferred_job_type == job_type:
        score += 15
        reasons.append("Matches your preferred job type")

    # Experience level match
    if experience_level and experience_level == job_experience:
        score += 15
        reasons.append("Matches your experience level")

    # Fresh jobs get a small boost
    if job.scraped_at:
        score += 5
        reasons.append("Recently scraped")

    return score, reasons, sorted(matched_skills)


def get_recommended_jobs(
    db: Session,
    user_id,
    limit: int = 10,
):
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == user_id)
        .first()
    )

    if not profile:
        return []

    query = (
        db.query(Job)
        .options(joinedload(Job.company))
        .filter(Job.is_active == True)
    )

    # Soft pre-filter to avoid scoring everything when profile has useful data
    filters = []

    if profile.target_role:
        target = f"%{profile.target_role}%"
        filters.append(Job.title.ilike(target))
        filters.append(Job.description.ilike(target))

    if profile.preferred_location:
        filters.append(Job.location.ilike(f"%{profile.preferred_location}%"))

    if profile.preferred_job_type:
        query = query.filter(Job.job_type == profile.preferred_job_type)

    if profile.experience_level:
        query = query.filter(Job.experience_level == profile.experience_level)

    if filters:
        query = query.filter(or_(*filters))

    jobs = (
        query.order_by(desc(Job.scraped_at))
        .limit(200)
        .all()
    )

    recommendations = []

    for job in jobs:
        job_skills = get_job_skill_names(db, job.id)
        score, reasons, matched_skills = score_job(
            job=job,
            profile=profile,
            job_skills=job_skills,
        )

        if score <= 0:
            continue

        recommendations.append(
            {
                "job": job,
                "score": score,
                "reasons": reasons,
                "matched_skills": matched_skills,
            }
        )

    recommendations.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return recommendations[:limit]