from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from tests.conftest import override_get_db, client

def test_login_success(override_get_db):
    """Test the /login endpoint with valid credentials."""
    app.dependency_overrides[get_db] = override_get_db

    user_data = {"email": "testuser@example.com", "password": "password123"}
    client.post("/users/register", json=user_data)

    login_data = {"email": "testuser@example.com", "password": "password123"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

    app.dependency_overrides.clear()


def test_login_invalid_password(override_get_db):
    """Test the /login endpoint with an invalid password."""
    app.dependency_overrides[get_db] = override_get_db

    user_data = {"email": "testuser@example.com", "password": "password123"}
    client.post("/users/register", json=user_data)

    login_data = {"email": "testuser@example.com", "password": "wrongpassword"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Credenciales incorrectas"

    app.dependency_overrides.clear()


def test_login_nonexistent_user(override_get_db):
    """Test the /login endpoint with a non-existent user."""
    app.dependency_overrides[get_db] = override_get_db

    login_data = {"email": "nonexistent@example.com", "password": "password123"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Credenciales incorrectas"

    app.dependency_overrides.clear()