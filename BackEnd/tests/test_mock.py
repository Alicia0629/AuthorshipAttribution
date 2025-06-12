import pytest
from sqlalchemy.orm import Session
from unittest.mock import MagicMock

@pytest.fixture
def mock_db():
    db = MagicMock(spec=Session)
    return db

@pytest.fixture
def mock_create_user(monkeypatch):
    def mock_create(db, user_data):
        return MagicMock(email=user_data.email, hashed_password="hashedpassword")
    monkeypatch.setattr("app.crud.user.create_user", mock_create)

@pytest.fixture
def mock_get_user_by_email(monkeypatch):
    def mock_get_user(db, email):
        if email == "test@example.com":
            user = MagicMock()
            user.email = "test@example.com"
            user.hashed_password = "hashedpassword"
            return user
        return None
    monkeypatch.setattr("app.crud.user.get_user_by_email", mock_get_user)

@pytest.fixture
def mock_get_current_user(monkeypatch):
    def mock_get_user(token: str):
        if token == "mocked_token":
            return {"email": "test@example.com", "id": 1}
        raise HTTPException(status_code=401, detail="Token inválido")
    monkeypatch.setattr("app.core.auth.get_current_user", mock_get_user)

@pytest.fixture
def mock_verify_password(monkeypatch):
    def mock_verify(pwd, hashed_pwd):
        return pwd == "password123" and hashed_pwd == "hashedpassword"
    monkeypatch.setattr("app.core.auth.verify_password", mock_verify)

@pytest.fixture
def mock_create_access_token(monkeypatch):
    def mock_create_token(data):
        return 'mocked_token'
    monkeypatch.setattr("app.core.auth.create_access_token", mock_create_token)