import uuid

from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def unique_email():
    return f"test-{uuid.uuid4().hex[:10]}@example.com"


def test_register_user_success():
    email = unique_email()

    response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "testpassword123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == email


def test_register_duplicate_email_fails():
    email = unique_email()

    first_response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "testpassword123",
        },
    )

    assert first_response.status_code == 200

    second_response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "testpassword123",
        },
    )

    assert second_response.status_code == 400
    assert second_response.json()["detail"] == "Email already registered"


def test_login_user_success():
    email = unique_email()
    password = "testpassword123"

    register_response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
        },
    )

    assert register_response.status_code == 200

    login_response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200

    data = login_response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == email


def test_login_invalid_password_fails():
    email = unique_email()

    register_response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "correctpassword123",
        },
    )

    assert register_response.status_code == 200

    login_response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": "wrongpassword123",
        },
    )

    assert login_response.status_code == 401
    assert login_response.json()["detail"] == "Invalid credentials"


def test_get_me_with_valid_token():
    email = unique_email()

    register_response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "testpassword123",
        },
    )

    assert register_response.status_code == 200

    token = register_response.json()["access_token"]

    me_response = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert me_response.status_code == 200

    data = me_response.json()

    assert data["email"] == email
    assert "id" in data


def test_get_me_without_token_fails():
    response = client.get("/auth/me")

    assert response.status_code in [401, 403]