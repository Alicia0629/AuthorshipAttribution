import pytest
from unittest.mock import patch, MagicMock
from app.db.session import get_db, SessionLocal

def test_get_db_session(monkeypatch):
    """Test que verifica que get_db crea y cierra la sesión correctamente."""

    mock_session = MagicMock()
    # Parcheamos SessionLocal para que retorne nuestro mock
    monkeypatch.setattr("app.db.session.SessionLocal", lambda: mock_session)

    gen = get_db()
    db = next(gen)
    assert db == mock_session  # La sesión yield es la que esperamos

    # Terminar el generador para que ejecute el finally y cierre la sesión
    with pytest.raises(StopIteration):
        next(gen)

    # Verificamos que se llamó a close() al cerrar la sesión
    mock_session.close.assert_called_once()
