from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from tests.conftest import override_get_db, client
from app.schemas.user import UserCreate
from app.crud import user as crud_user
from app.models.user import User


def test_get_user_by_email_existing(override_get_db):
    """Test obtener usuario por email existente."""
    app.dependency_overrides[get_db] = override_get_db
    db = next(override_get_db())

    # Crear usuario directamente en la DB
    user_in = User(email="test@example.com", hashed_password="hashed_pw")
    db.add(user_in)
    db.commit()
    db.refresh(user_in)

    found_user = crud_user.get_user_by_email(db, "test@example.com")
    assert found_user is not None
    assert found_user.email == "test@example.com"

    app.dependency_overrides.clear()


def test_get_user_by_email_nonexistent(override_get_db):
    """Test obtener usuario por email no existente devuelve None."""
    app.dependency_overrides[get_db] = override_get_db
    db = next(override_get_db())

    found_user = crud_user.get_user_by_email(db, "noone@example.com")
    assert found_user is None

    app.dependency_overrides.clear()


def test_create_user(override_get_db):
    """Test crear un usuario usando create_user."""
    app.dependency_overrides[get_db] = override_get_db
    db = next(override_get_db())

    user_data = UserCreate(email="newuser@example.com", password="plaintext")
    created_user = crud_user.create_user(db, user_data)

    assert created_user.email == user_data.email
    assert created_user.hashed_password != user_data.password  # Debe estar hasheado

    # Verificar que está en la base de datos
    db_user = crud_user.get_user_by_email(db, user_data.email)
    assert db_user is not None

    app.dependency_overrides.clear()


def test_delete_user(override_get_db):
    """Test eliminar un usuario."""
    app.dependency_overrides[get_db] = override_get_db
    db = next(override_get_db())

    user = User(email="tobedeleted@example.com", hashed_password="hashed_pw")
    db.add(user)
    db.commit()
    db.refresh(user)

    crud_user.delete_user(db, user)

    deleted_user = crud_user.get_user_by_email(db, user.email)
    assert deleted_user is None

    app.dependency_overrides.clear()
