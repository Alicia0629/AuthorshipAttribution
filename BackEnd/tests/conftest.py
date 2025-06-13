import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from fastapi.testclient import TestClient

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def prepare_database():
    """Create and drop tables for the test database."""
    Base.metadata.create_all(bind=engine)  # Create all tables
    yield
    Base.metadata.drop_all(bind=engine)  # Drop all tables after tests

@pytest.fixture()
def db_session():
    """Provide a transactional database session for each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture()
def override_get_db(db_session):
    """Override the `get_db` dependency to use the test database session."""
    def _get_test_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = _get_test_db
    return _get_test_db

@pytest.fixture
def new_user():
    """Create a new user for testing."""
    user_data = {"email": "testuser@example.com", "password": "password123"}
    response = client.post("/users/register", json=user_data)
    assert response.status_code == 200
    return user_data

@pytest.fixture
def auth_token(new_user):
    """Authenticate the test user and return the token."""
    login_data = {"email": new_user["email"], "password": new_user["password"]}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token
    return token