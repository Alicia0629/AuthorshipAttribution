from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from tests.conftest import override_get_db, client
from app.schemas.model import ModelCreate, ModelUpdateStatus
from app.crud import model as crud_model

def test_create_model(override_get_db):
    """Test que crea un modelo vía la función create_model directamente."""
    app.dependency_overrides[get_db] = override_get_db
    db = next(override_get_db())
    model_in = ModelCreate(user_id=1, runpod_model_id="rp_123", status="pending", num_labels=5)
    
    from app.crud import model as crud_model
    db_model = crud_model.create_model(db, model_in)

    assert db_model.user_id == model_in.user_id
    assert db_model.runpod_model_id == model_in.runpod_model_id
    assert db_model.status == model_in.status
    assert db_model.num_labels == model_in.num_labels
    
    app.dependency_overrides.clear()

def test_get_model_by_id(override_get_db):
    """Test obtener modelo por id."""
    app.dependency_overrides[get_db] = override_get_db
    db = next(override_get_db())

    # Crear un modelo para obtenerlo
    model_in = ModelCreate(user_id=1, runpod_model_id="rp_abc", status="ready", num_labels=3)
    db_model = crud_model.create_model(db, model_in)

    found_model = crud_model.get_model_by_id(db, db_model.id)
    assert found_model.id == db_model.id
    
    app.dependency_overrides.clear()

def test_update_model_status(override_get_db):
    """Test actualizar el status del modelo."""
    app.dependency_overrides[get_db] = override_get_db
    db = next(override_get_db())
    
    model_in = ModelCreate(user_id=1, runpod_model_id="rp_xyz", status="pending", num_labels=4)
    db_model = crud_model.create_model(db, model_in)

    update_data = ModelUpdateStatus(
        model_id=db_model.id,
        status="trained",
        eval_accuracy=0.85,
        eval_f1=0.8,
        eval_loss=0.1
    )
    updated_model = crud_model.update_model_status(db, update_data)
    assert updated_model.status == "trained"
    assert updated_model.eval_accuracy == 0.85
    assert updated_model.eval_f1 == 0.8
    assert updated_model.eval_loss == 0.1
    
    app.dependency_overrides.clear()


def test_update_model_status_not_found(override_get_db):
    """Test update_model_status devuelve None si no encuentra el modelo."""
    app.dependency_overrides[get_db] = override_get_db
    db = next(override_get_db())

    fake_update_data = ModelUpdateStatus(
        model_id=-1,
        status="trained",
        eval_accuracy=0.9,
        eval_f1=0.8,
        eval_loss=0.1
    )
    
    result = crud_model.update_model_status(db, fake_update_data)
    assert result is None
    
    app.dependency_overrides.clear()

def test_delete_model(override_get_db):
    """Test eliminar un modelo."""
    app.dependency_overrides[get_db] = override_get_db
    db = next(override_get_db())

    model_in = ModelCreate(user_id=1, runpod_model_id="rp_del", status="pending", num_labels=2)
    db_model = crud_model.create_model(db, model_in)

    result = crud_model.delete_model(db, db_model.id)
    assert result is True
    assert crud_model.get_model_by_id(db, db_model.id) is None
    
    app.dependency_overrides.clear()

def test_delete_model_not_found(override_get_db):
    """Test delete_model devuelve False si no encuentra el modelo."""
    app.dependency_overrides[get_db] = override_get_db
    db = next(override_get_db())

    result = crud_model.delete_model(db, "nonexistent_id")
    assert result is False
    
    app.dependency_overrides.clear()

def test_update_id_runpod_model(override_get_db):
    """Test actualizar runpod_model_id."""
    app.dependency_overrides[get_db] = override_get_db
    db = next(override_get_db())
    from app.crud import model as crud_model

    model_in = ModelCreate(user_id=1, runpod_model_id="rp_old", status="pending", num_labels=1)
    db_model = crud_model.create_model(db, model_in)

    success = crud_model.update_id_runpod_model(db, db_model.id, "rp_new")
    assert success is True

    updated_model = crud_model.get_model_by_id(db, db_model.id)
    assert updated_model.runpod_model_id == "rp_new"
    
    app.dependency_overrides.clear()

def test_get_latest_model_by_user(override_get_db):
    """Test obtener el último modelo creado por un usuario."""
    app.dependency_overrides[get_db] = override_get_db
    db = next(override_get_db())
    from app.crud import model as crud_model

    # Crear dos modelos para el mismo usuario
    model1 = ModelCreate(user_id=2, runpod_model_id="rp_1", status="ready", num_labels=1)
    model2 = ModelCreate(user_id=2, runpod_model_id="rp_2", status="ready", num_labels=2)
    crud_model.create_model(db, model1)
    last_model = crud_model.create_model(db, model2)

    latest = crud_model.get_latest_model_by_user(db, user_id=2)
    assert latest.id == last_model.id

    app.dependency_overrides.clear()


