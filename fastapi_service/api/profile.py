from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from dependencies import get_db
from api.auth import get_current_user
from models.profile import Profile
from models.user import User
from schemas.profile import ProfileResponse, ProfileUpdate


router = APIRouter(prefix="/profile", tags=["Profile"])


def normalize_skills(skills):
    if not skills:
        return []

    cleaned = []

    for skill in skills:
        value = skill.strip().lower()

        if value and value not in cleaned:
            cleaned.append(value)

    return cleaned


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .first()
    )

    if profile:
        return profile

    profile = Profile(
        user_id=current_user.id,
        full_name=None,
        headline=None,
        target_role=None,
        experience_level=None,
        preferred_location=None,
        preferred_job_type=None,
        skills=[],
        github_url=None,
        linkedin_url=None,
        portfolio_url=None,
        resume_url=None,
        bio=None,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .first()
    )

    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    profile.full_name = payload.full_name
    profile.headline = payload.headline
    profile.target_role = payload.target_role
    profile.experience_level = payload.experience_level
    profile.preferred_location = payload.preferred_location
    profile.preferred_job_type = payload.preferred_job_type
    profile.skills = normalize_skills(payload.skills)
    profile.github_url = payload.github_url
    profile.linkedin_url = payload.linkedin_url
    profile.portfolio_url = payload.portfolio_url
    profile.resume_url = payload.resume_url
    profile.bio = payload.bio

    db.commit()
    db.refresh(profile)

    return profile