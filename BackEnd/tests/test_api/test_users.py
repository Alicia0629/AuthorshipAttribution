from fastapi.testclient import TestClient
from app.main import app
from tests.test_mock import (
    mock_db,
    mock_create_user,
    mock_get_user_by_email,
    mock_get_current_user,
    mock_verify_password,
    mock_create_access_token
)

client = TestClient(app)

def test_register_user(mock_db, mock_create_user, mock_get_user_by_email):
    user_data = {"email": "test2@example.com", "password": "password123"}
    
    response = client.post("/users/register", json=user_data)
    
    assert response.status_code == 200
    assert response.json()["email"] == "test2@example.com"
