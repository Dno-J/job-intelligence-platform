import uuid

import pytest
from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def unique_email():
    return f"saved-{uuid.uuid4().hex[:10]}@example.com"


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


def get_first_job_id_or_skip():
    response = client.get("/jobs")

    assert response.status_code == 200

    jobs = response.json()["results"]

    if not jobs:
        pytest.skip("No jobs available in database to test saved jobs.")

    return jobs[0]["id"]


def test_get_saved_jobs_requires_auth():
    response = client.get("/saved-jobs")

    assert response.status_code in [401, 403]


def test_get_saved_job_stats_requires_auth():
    response = client.get("/saved-jobs/stats")

    assert response.status_code in [401, 403]


def test_save_job_success():
    headers = create_auth_headers()
    job_id = get_first_job_id_or_skip()

    response = client.post(
        f"/saved-jobs/{job_id}",
        headers=headers,
    )

    assert response.status_code in [200, 201]

    data = response.json()

    assert "message" in data
    assert str(data["job_id"]) == job_id


def test_save_duplicate_job_does_not_crash():
    headers = create_auth_headers()
    job_id = get_first_job_id_or_skip()

    first_response = client.post(
        f"/saved-jobs/{job_id}",
        headers=headers,
    )

    assert first_response.status_code in [200, 201]

    second_response = client.post(
        f"/saved-jobs/{job_id}",
        headers=headers,
    )

    assert second_response.status_code in [200, 201]

    data = second_response.json()

    assert "message" in data
    assert str(data["job_id"]) == job_id


def test_get_saved_jobs_success():
    headers = create_auth_headers()
    job_id = get_first_job_id_or_skip()

    save_response = client.post(
        f"/saved-jobs/{job_id}",
        headers=headers,
    )

    assert save_response.status_code in [200, 201]

    response = client.get(
        "/saved-jobs",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 1

    saved_job = data[0]

    assert "id" in saved_job
    assert "title" in saved_job
    assert "application_status" in saved_job


def test_get_saved_job_stats_success():
    headers = create_auth_headers()
    job_id = get_first_job_id_or_skip()

    save_response = client.post(
        f"/saved-jobs/{job_id}",
        headers=headers,
    )

    assert save_response.status_code in [200, 201]

    response = client.get(
        "/saved-jobs/stats",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert "total" in data
    assert "saved" in data
    assert "applied" in data
    assert "interviewing" in data
    assert "offer" in data
    assert "rejected" in data

    assert data["total"] >= 1


def test_update_saved_job_status_success():
    headers = create_auth_headers()
    job_id = get_first_job_id_or_skip()

    save_response = client.post(
        f"/saved-jobs/{job_id}",
        headers=headers,
    )

    assert save_response.status_code in [200, 201]

    update_response = client.patch(
        f"/saved-jobs/{job_id}",
        json={
            "status": "applied",
        },
        headers=headers,
    )

    assert update_response.status_code == 200

    # Verify by fetching saved jobs again because PATCH may only return a message.
    saved_jobs_response = client.get(
        "/saved-jobs",
        headers=headers,
    )

    assert saved_jobs_response.status_code == 200

    saved_jobs = saved_jobs_response.json()

    updated_job = next(
        job for job in saved_jobs if job["id"] == job_id
    )

    assert updated_job["application_status"] == "applied"


def test_update_saved_job_notes_success():
    headers = create_auth_headers()
    job_id = get_first_job_id_or_skip()

    save_response = client.post(
        f"/saved-jobs/{job_id}",
        headers=headers,
    )

    assert save_response.status_code in [200, 201]

    notes = "Applied through company website."

    update_response = client.patch(
        f"/saved-jobs/{job_id}",
        json={
            "notes": notes,
        },
        headers=headers,
    )

    assert update_response.status_code == 200

    # Verify by fetching saved jobs again because PATCH may only return a message.
    saved_jobs_response = client.get(
        "/saved-jobs",
        headers=headers,
    )

    assert saved_jobs_response.status_code == 200

    saved_jobs = saved_jobs_response.json()

    updated_job = next(
        job for job in saved_jobs if job["id"] == job_id
    )

    assert updated_job["notes"] == notes


def test_filter_saved_jobs_by_status():
    headers = create_auth_headers()
    job_id = get_first_job_id_or_skip()

    save_response = client.post(
        f"/saved-jobs/{job_id}",
        headers=headers,
    )

    assert save_response.status_code in [200, 201]

    update_response = client.patch(
        f"/saved-jobs/{job_id}",
        json={
            "status": "interviewing",
        },
        headers=headers,
    )

    assert update_response.status_code == 200

    response = client.get(
        "/saved-jobs",
        params={
            "status_filter": "interviewing",
        },
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 1

    assert all(
        job["application_status"] == "interviewing"
        for job in data
    )


def test_unsave_job_success():
    headers = create_auth_headers()
    job_id = get_first_job_id_or_skip()

    save_response = client.post(
        f"/saved-jobs/{job_id}",
        headers=headers,
    )

    assert save_response.status_code in [200, 201]

    delete_response = client.delete(
        f"/saved-jobs/{job_id}",
        headers=headers,
    )

    assert delete_response.status_code == 200

    data = delete_response.json()

    assert "message" in data
    assert str(data["job_id"]) == job_id


def test_unsave_missing_job_fails():
    headers = create_auth_headers()
    job_id = get_first_job_id_or_skip()

    response = client.delete(
        f"/saved-jobs/{job_id}",
        headers=headers,
    )

    assert response.status_code == 404