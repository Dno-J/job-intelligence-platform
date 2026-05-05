from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_list_jobs_success():
    response = client.get("/jobs")

    assert response.status_code == 200

    data = response.json()

    assert "meta" in data
    assert "filters" in data
    assert "results" in data
    assert isinstance(data["results"], list)

    assert "page" in data["meta"]
    assert "page_size" in data["meta"]
    assert "total" in data["meta"]
    assert "total_pages" in data["meta"]


def test_list_jobs_with_pagination():
    response = client.get(
        "/jobs",
        params={
            "page": 1,
            "page_size": 5,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["meta"]["page"] == 1
    assert data["meta"]["page_size"] == 5
    assert isinstance(data["results"], list)
    assert len(data["results"]) <= 5


def test_list_jobs_with_filters():
    response = client.get(
        "/jobs",
        params={
            "search": "python",
            "location": "remote",
            "job_type": "full-time",
            "experience_level": "mid",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["filters"]["search"] == "python"
    assert data["filters"]["location"] == "remote"
    assert data["filters"]["job_type"] == "full-time"
    assert data["filters"]["experience_level"] == "mid"
    assert isinstance(data["results"], list)


def test_list_jobs_invalid_page_fails():
    response = client.get(
        "/jobs",
        params={
            "page": 0,
        },
    )

    assert response.status_code == 422


def test_list_jobs_invalid_page_size_fails():
    response = client.get(
        "/jobs",
        params={
            "page_size": 101,
        },
    )

    assert response.status_code == 422


def test_list_jobs_invalid_job_type_fails():
    response = client.get(
        "/jobs",
        params={
            "job_type": "freelance",
        },
    )

    assert response.status_code == 422


def test_get_job_detail_success_if_jobs_exist():
    list_response = client.get("/jobs")

    assert list_response.status_code == 200

    jobs = list_response.json()["results"]

    if not jobs:
        return

    job_id = jobs[0]["id"]

    detail_response = client.get(f"/jobs/{job_id}")

    assert detail_response.status_code == 200

    data = detail_response.json()

    assert data["id"] == job_id
    assert "title" in data
    assert "company" in data


def test_get_job_detail_invalid_uuid_fails():
    response = client.get("/jobs/not-a-valid-uuid")

    assert response.status_code == 422