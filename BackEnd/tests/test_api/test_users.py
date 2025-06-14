from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from tests.conftest import override_get_db, auth_token, client

def test_register_user_success(override_get_db):
    """Test the /register endpoint with valid data."""
    app.dependency_overrides[get_db] = override_get_db

    user_data = {"email": "newuser@example.com", "password": "password123"}
    response = client.post("/users/register", json=user_data)
    assert response.status_code == 200
    assert response.json()["email"] == user_data["email"]

    app.dependency_overrides.clear()


def test_register_user_already_exists(override_get_db):
    """Test the /register endpoint with an already registered email."""
    app.dependency_overrides[get_db] = override_get_db

    user_data = {"email": "testuser@example.com", "password": "password123"}
    client.post("/users/register", json=user_data)
    response = client.post("/users/register", json=user_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Usuario ya registrado"

    app.dependency_overrides.clear()


def test_read_users_me_success(override_get_db, auth_token):
    """Test the /me endpoint with a valid token."""
    app.dependency_overrides[get_db] = override_get_db

    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/users/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "testuser@example.com"

    app.dependency_overrides.clear()


def test_read_users_me_unauthorized(override_get_db):
    """Test the /me endpoint without a token."""
    app.dependency_overrides[get_db] = override_get_db

    response = client.get("/users/me")
    assert response.status_code == 401

    app.dependency_overrides.clear()


def test_delete_account_success(override_get_db, auth_token):
    """Test the /delete-account endpoint with a valid token."""
    app.dependency_overrides[get_db] = override_get_db

    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.delete("/users/delete-account", headers=headers)
    assert response.status_code == 204

    app.dependency_overrides.clear()


def test_delete_account_not_found(override_get_db, auth_token):
    """Test the /delete-account endpoint for a non-existent user."""
    app.dependency_overrides[get_db] = override_get_db

    # Delete the user first
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.delete("/users/delete-account", headers=headers)
    assert response.status_code == 204

    # Try deleting again
    response = client.delete("/users/delete-account", headers=headers)
    assert response.status_code == 401

    app.dependency_overrides.clear()
