import pytest
from datetime import datetime, timedelta, timezone
from jose import jwt
from jose.exceptions import JWSError
from fastapi import HTTPException
from app.core.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)

from app.core.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

from unittest.mock import MagicMock, patch

def test_verify_password():
    """Test que verifica el funcionamiento de verify_password."""
    # Crear un hash de contraseña
    password = "test_password"
    hashed = get_password_hash(password)
    
    # Verificar contraseña correcta
    assert verify_password(password, hashed) is True
    
    # Verificar contraseña incorrecta
    assert verify_password("wrong_password", hashed) is False

def test_get_password_hash():
    """Test que verifica el funcionamiento de get_password_hash."""
    password = "test_password"
    hashed = get_password_hash(password)
    
    # Verificar que el hash es diferente a la contraseña original
    assert hashed != password
    
    # Verificar que el hash es válido
    assert verify_password(password, hashed) is True

def test_create_access_token():
    """Test que verifica el funcionamiento de create_access_token."""
    # Datos de prueba
    test_data = {"email": "test@example.com"}
    
    # Crear token
    token = create_access_token(test_data)
    
    # Decodificar token y verificar contenido
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == test_data["email"]
    
    # Verificar que el token expira en el tiempo correcto
    exp_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
    expected_exp = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    assert abs((exp_time - expected_exp).total_seconds()) < 10  # Permitir 10 segundos de diferencia

@patch("app.crud.user.get_user_by_email")
def test_get_current_user_success(mock_get_user):
    """Test que verifica el funcionamiento exitoso de get_current_user."""
    # Crear un usuario mock
    mock_user = MagicMock()
    mock_user.email = "test@example.com"
    mock_get_user.return_value = mock_user
    
    # Crear un token válido
    token = create_access_token({"email": "test@example.com"})
    
    # Crear una sesión mock
    mock_db = MagicMock()
    
    # Obtener usuario
    user = get_current_user(token, mock_db)
    assert user.email == "test@example.com"

@patch("app.crud.user.get_user_by_email")
def test_get_current_user_invalid_token(mock_get_user):
    """Test que verifica el manejo de tokens inválidos en get_current_user."""
    mock_get_user.return_value = None
    mock_db = MagicMock()
    
    with pytest.raises(HTTPException) as exc_info:
        get_current_user("invalid_token", mock_db)
    
    assert exc_info.value.status_code == 401
    assert "No se pudo validar credenciales" in str(exc_info.value.detail)

@patch("app.crud.user.get_user_by_email")
def test_get_current_user_expired_token(mock_get_user):
    """Test que verifica el manejo de tokens expirados en get_current_user."""
    # Crear un token expirado
    expired_token_data = {
        "sub": "test@example.com",
        "exp": datetime.now(timezone.utc) - timedelta(minutes=1)
    }
    expired_token = jwt.encode(expired_token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    mock_db = MagicMock()
    
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(expired_token, mock_db)
    
    assert exc_info.value.status_code == 401
    assert "Token expired" in str(exc_info.value.detail)

def test_get_current_user_no_email():
    """Test que verifica el manejo de tokens sin email en get_current_user."""
    token_data = {}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    mock_db = MagicMock()
    
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(token, mock_db)
    assert exc_info.value.status_code == 401
    assert "No se pudo validar credenciales" in exc_info.value.detail


def test_get_current_user_jws_error(capfd):
    """Test que verifica el manejo de errores JWS en get_current_user."""
    token = "dummy_token"
    mock_db = MagicMock()
    
    with patch("jose.jwt.decode", side_effect=JWSError("JWS test error")):
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(token, mock_db)
        out, err = capfd.readouterr()
        assert "JWS Error: JWS test error" in out
        assert exc_info.value.status_code == 401

@patch("app.crud.user.get_user_by_email")
def test_get_current_user_user_not_found(mock_get_user):
    """Test que verifica el manejo de usuarios no encontrados en get_current_user."""
    # Simular que no se encuentra el usuario
    mock_get_user.return_value = None
    
    # Crear un token válido
    token = create_access_token({"email": "test@example.com"})
    mock_db = MagicMock()
    
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(token, mock_db)
    
    assert exc_info.value.status_code == 401
    assert "No se pudo validar credenciales" in str(exc_info.value.detail)
