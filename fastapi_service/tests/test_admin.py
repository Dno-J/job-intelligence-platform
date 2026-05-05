from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_admin_scrape_requires_secret():
    response = client.post("/admin/scrape-once")

    assert response.status_code in [403, 500]


def test_admin_scrape_rejects_invalid_secret():
    response = client.post(
        "/admin/scrape-once",
        headers={
            "X-Admin-Secret": "wrong-secret",
        },
    )

    assert response.status_code in [403, 500]


def test_admin_scrape_invalid_source_with_valid_secret(monkeypatch):
    monkeypatch.setenv(
        "ADMIN_SECRET_KEY",
        "test-admin-secret",
    )

    response = client.post(
        "/admin/scrape-once",
        params={
            "source": "invalid-source",
            "limit": 1,
        },
        headers={
            "X-Admin-Secret": "test-admin-secret",
        },
    )

    assert response.status_code == 400