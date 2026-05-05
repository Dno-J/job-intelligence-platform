import uuid

from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def unique_email():
    return f"profile-{uuid.uuid4().hex[:10]}@example.com"


def create_auth_headers():
    email = unique_email()

    response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "testpassword123",
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }


def test_get_profile_success():
    headers = create_auth_headers()

    response = client.get(
        "/profile/me",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert "id" in data
    assert "user_id" in data
    assert "skills" in data
    assert isinstance(data["skills"], list)


def test_update_profile_success():
    headers = create_auth_headers()

    payload = {
        "full_name": "Test User",
        "headline": "Python Developer",
        "target_role": "Backend Developer",
        "experience_level": "junior",
        "preferred_location": "Remote",
        "preferred_job_type": "full-time",
        "skills": ["python", "fastapi", "postgresql"],
        "github_url": "https://github.com/test-user",
        "linkedin_url": "https://linkedin.com/in/test-user",
        "portfolio_url": "https://example.com",
        "resume_url": "https://example.com/resume.pdf",
        "bio": "Aspiring backend developer.",
    }

    response = client.put(
        "/profile/me",
        json=payload,
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["full_name"] == payload["full_name"]
    assert data["headline"] == payload["headline"]
    assert data["target_role"] == payload["target_role"]
    assert data["experience_level"] == payload["experience_level"]
    assert data["preferred_location"] == payload["preferred_location"]
    assert data["preferred_job_type"] == payload["preferred_job_type"]
    assert data["skills"] == payload["skills"]
    assert data["bio"] == payload["bio"]


def test_profile_requires_auth():
    response = client.get("/profile/me")

    assert response.status_code in [401, 403]