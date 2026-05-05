from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_dashboard_endpoint_success():
    response = client.get("/analytics/dashboard")

    assert response.status_code == 200

    data = response.json()

    assert "top_skills" in data
    assert "top_companies" in data
    assert "job_trends" in data

    assert isinstance(data["top_skills"], list)
    assert isinstance(data["top_companies"], list)
    assert isinstance(data["job_trends"], list)


def test_dashboard_with_range_filter_success():
    response = client.get(
        "/analytics/dashboard",
        params={
            "range": "30d",
            "limit": 10,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "top_skills" in data
    assert "top_companies" in data
    assert "job_trends" in data


def test_top_skills_endpoint_success():
    response = client.get(
        "/analytics/top-skills",
        params={
            "limit": 10,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)

    if data:
        assert "skill" in data[0]
        assert "count" in data[0]


def test_top_skills_endpoint_success():
    response = client.get(
        "/analytics/top-skills",
        params={
            "limit": 10,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)

    if data:
        assert "skill" in data[0]
        assert "demand" in data[0]
        assert isinstance(data[0]["demand"], int)