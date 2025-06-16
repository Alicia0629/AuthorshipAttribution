from unittest.mock import patch
from app.db import init_db

def test_init_db_calls_create_all():
    with patch('app.db.base.Base.metadata.create_all') as mock_create_all:
        init_db.init_db()  # Llama a la función que quieres testear
        mock_create_all.assert_called_once_with(bind=init_db.engine)
