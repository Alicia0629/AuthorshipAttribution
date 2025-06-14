from app.core.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    DB_URL
)

def test_config_values():
    """Test que verifica la configuración de variables de entorno."""
    assert isinstance(SECRET_KEY, str)
    assert ALGORITHM == "HS256"
    assert isinstance(ACCESS_TOKEN_EXPIRE_MINUTES, int)
    assert isinstance(DB_URL, str)