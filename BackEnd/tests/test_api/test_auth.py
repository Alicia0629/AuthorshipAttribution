from fastapi.testclient import TestClient
from app.main import app
from tests.test_mock import (
    mock_db,  # noqa: F401
    mock_get_user_by_email,  # noqa: F401
    mock_verify_password,  # noqa: F401
    mock_create_access_token,  # noqa: F401
    mock_create_user  # noqa: F401
)

client = TestClient(app)

def test_login_success(mock_db, mock_get_user_by_email, mock_verify_password, mock_create_access_token, mock_create_user):
    data = {"email": "test@example.com", "password": "password123"}

    client.post("/users/register", json=data)
    
    response = client.post("/auth/login", json=data)
    
    assert response.status_code == 200
    assert response.json() == {"access_token": "mocked_token", "token_type": "bearer"}

def test_login_invalid_credentials(mock_db, mock_get_user_by_email, mock_verify_password):
    login_data = {"email": "wrong@example.com", "password": "wrongpassword"}
    
    response = client.post("/auth/login", json=login_data)
    
    assert response.status_code == 400
    assert response.json() == {"detail": "Credenciales incorrectas"}

