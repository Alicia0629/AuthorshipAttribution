import json
import pytest
from unittest.mock import patch, MagicMock
from app.main import app
from app.db.session import get_db
from tests.conftest import override_get_db, auth_token, client
from fastapi import HTTPException
from app.api.model import check_model

TEST_REQUEST_PAYLOAD = {
    "text_column": "text",
    "label_column": "label",
    "num_labels": 2,
    "file": "mock-file-path.csv"
}

def setup_test(auth_token, override_get_db):
    """Configuración común para los tests."""
    app.dependency_overrides[get_db] = override_get_db
    headers = {"Authorization": f"Bearer {auth_token}"}
    return headers

def cleanup_test():
    """Limpieza después de cada test."""
    app.dependency_overrides.clear()

def create_test_model(mock_requests_post, headers):
    """Crea un modelo de prueba y retorna su ID."""
    mock_requests_post.return_value.json.return_value = {
        "id": "mocked_runpod_id",
        "status": "training"
    }
    
    train_response = client.post("/model/train", json=TEST_REQUEST_PAYLOAD, headers=headers)
    assert train_response.status_code == 200
    return train_response.json()["model_id"]

@patch("app.api.model.crud.create_model")
@patch("app.api.model.crud.update_model_status")
@patch("app.api.model.crud.update_id_runpod_model")
@patch("requests.post")
def test_train_model_success(
    mock_requests_post,
    mock_update_runpod_id,
    mock_update_status,
    mock_create_model,
    override_get_db,
    auth_token
):
    """Test del endpoint /model/train con datos válidos."""
    headers = setup_test(auth_token, override_get_db)
    
    # Configurar mocks
    mock_model = MagicMock()
    mock_model.id, mock_model.user_id, mock_model.status = 123, 1, "pending"
    mock_create_model.return_value = mock_model
    mock_requests_post.return_value.json.return_value = {
        "id": "mocked_runpod_model_id",
        "status": "training"
    }

    # Ejecutar test
    response = client.post("/model/train", json=TEST_REQUEST_PAYLOAD, headers=headers)
    
    # Verificar resultados
    assert response.status_code == 200
    data = response.json()
    assert all(key in data for key in ["job_id", "model_id"])
    assert data["response"]["id"] == "mocked_runpod_model_id"
    assert data["response"]["status"] == "training"

    cleanup_test()

@patch("app.api.model.crud.get_model_by_id")
@patch("requests.post")
def test_predict_model_success(mock_requests_post, mock_get_model_by_id, override_get_db, auth_token):
    """Test del endpoint /model/predict con datos válidos."""
    headers = setup_test(auth_token, override_get_db)

    # Configurar mocks
    mock_model = MagicMock()
    mock_model.id, mock_model.user_id, mock_model.status = 1, 1, "trained"
    mock_get_model_by_id.return_value = mock_model
    
    prediction_response = {
        "id": "mocked_prediction_id",
        "output": {"prediction": "author1"}
    }
    mock_requests_post.return_value.json.return_value = prediction_response
    mock_requests_post.return_value.text = json.dumps(prediction_response)

    # Ejecutar test
    predict_data = {"text": "This is a test text.", "model_id": "1"}
    response = client.post("/model/predict", json=predict_data, headers=headers)

    # Verificar resultados
    assert response.status_code == 200
    assert response.json()["id"] == "mocked_prediction_id"
    assert response.json()["output"]["prediction"] == "author1"

    cleanup_test()

@patch("requests.post")
def test_delete_model_success(mock_requests_post, override_get_db, auth_token):
    """Test del endpoint /model/delete con datos válidos."""
    headers = setup_test(auth_token, override_get_db)
    
    # Crear modelo
    model_id = create_test_model(mock_requests_post, headers)
    
    # Configurar mock para delete
    mock_requests_post.return_value.json.return_value = {"status": "deleted"}
    
    # Ejecutar test
    delete_data = {"model_id": str(model_id)}
    response = client.post("/model/delete", json=delete_data, headers=headers)

    # Verificar resultados
    assert response.status_code == 200
    assert response.json()["status"] == "deleted"

    cleanup_test()

@patch("requests.post")
@patch("requests.get")
def test_check_status_success(mock_requests_get, mock_requests_post, override_get_db, auth_token):
    """Test del endpoint /model/status/{model_id} con datos válidos."""
    headers = setup_test(auth_token, override_get_db)
    
    # Crear modelo
    model_id = create_test_model(mock_requests_post, headers)
    
    # Configurar mock para status
    mock_requests_get.return_value.json.return_value = {
        "status": "COMPLETED",
        "output": {"evaluate": {"eval_accuracy": 0.95, "eval_f1": 0.92, "eval_loss": 0.1}}
    }

    # Ejecutar test
    response = client.get(f"/model/status/{model_id}", headers=headers)

    # Verificar resultados
    assert response.status_code == 200
    assert response.json()["status"] == "COMPLETED"
    assert response.json()["output"]["evaluate"]["eval_accuracy"] == 0.95
    assert response.json()["output"]["evaluate"]["eval_f1"] == 0.92
    assert response.json()["output"]["evaluate"]["eval_loss"] == 0.1

    cleanup_test()

@patch("requests.post")
@patch("requests.get")
def test_check_status_unparseable_error(mock_requests_get, mock_requests_post, override_get_db, auth_token):
    headers = setup_test(auth_token, override_get_db)
    
    # Crear modelo
    model_id = create_test_model(mock_requests_post, headers)

    # Simula un error que no es un JSON parseable
    mock_requests_get.return_value.json.return_value = {
        "error": "this-is-not-json"
    }

    response = client.get(f"/model/status/{model_id}", headers=headers)

    assert response.status_code == 200
    assert response.json()["error"] == "this-is-not-json"

    cleanup_test()

@patch("app.api.model.crud.delete_model")
@patch("requests.post")
@patch("requests.get")
def test_check_status_file_not_found_deletes_model(mock_requests_get, mock_requests_post, mock_delete_model, override_get_db, auth_token):
    headers = setup_test(auth_token, override_get_db)
    
    # Crear modelo
    model_id = create_test_model(mock_requests_post, headers)

    mock_requests_get.return_value.json.return_value = {
        "error": json.dumps({"error_type": "<class 'FileNotFoundError'>"})
    }

    mock_delete_model.return_value = True

    response = client.get(f"/model/status/{model_id}", headers=headers)

    assert response.status_code == 200
    assert response.json()["status"] == "deleted"

    cleanup_test()

@patch("app.api.model.crud.delete_model")
@patch("requests.post")
@patch("requests.get")
def test_check_status_file_not_found_delete_fails(mock_requests_get, mock_requests_post, mock_delete_model, override_get_db, auth_token):
    headers = setup_test(auth_token, override_get_db)
    
    # Crear modelo
    model_id = create_test_model(mock_requests_post, headers)

    mock_requests_get.return_value.json.return_value = {
        "error": json.dumps({"error_type": "<class 'FileNotFoundError'>"})
    }

    mock_delete_model.return_value = False

    response = client.get(f"/model/status/{model_id}", headers=headers)

    assert response.status_code == 200
    assert response.json()["error"] == '{"error_type": "<class \'FileNotFoundError\'>"}'

    cleanup_test()



@patch("requests.post")
@patch("requests.get")
def test_get_latest_model_success(mock_requests_get, mock_requests_post, override_get_db, auth_token):
    """Test del endpoint /model/latest-model."""
    headers = setup_test(auth_token, override_get_db)
    
    # Crear modelo
    model_id = create_test_model(mock_requests_post, headers)
    
    # Configurar mock para latest-model
    mock_requests_get.return_value.json.return_value = {
        "model_id": str(model_id),
        "status": "training"
    }

    # Ejecutar test
    response = client.get("/model/latest-model", headers=headers)

    # Verificar resultados
    assert response.status_code == 200
    assert response.json()["model_id"] == 1
    assert response.json()["status"] == "training"

    cleanup_test()


@patch("app.api.model.crud.get_latest_model_by_user")
def test_get_latest_model_no_model(mock_get_latest_model_by_user, override_get_db, auth_token):
    headers = setup_test(auth_token, override_get_db)

    # Mock para que retorne None -> simula que no hay modelos
    mock_get_latest_model_by_user.return_value = None

    response = client.get("/model/latest-model", headers=headers)

    assert response.status_code == 200
    assert response.json() == {"status": "no_model"}

    cleanup_test()


@patch("requests.post")
@patch("requests.get")
def test_get_model_details_success(mock_requests_get, mock_requests_post, override_get_db, auth_token):
    """Test del endpoint /model/{model_id}."""
    headers = setup_test(auth_token, override_get_db)
    
    # Crear modelo
    model_id = create_test_model(mock_requests_post, headers)
    
    # Configurar mock para model details
    mock_requests_get.return_value.json.return_value = {
        "eval_accuracy": 0.95,
        "eval_f1": 0.92,
        "eval_loss": 0.1,
        "num_labels": 2,
        "created_at": "2023-01-01T00:00:00"
    }

    # Ejecutar test
    response = client.get(f"/model/{model_id}", headers=headers)

    # Verificar resultados
    assert response.status_code == 200
    assert response.json()["num_labels"] == 2

    cleanup_test()


def test_check_model_passes_when_model_exists_and_user_matches():
    current_user = MagicMock()
    current_user.id = 1
    
    model = MagicMock()
    model.user_id = 1
    
    # No debería lanzar excepción
    check_model(current_user, model)

def test_check_model_raises_404_when_model_is_none():
    current_user = MagicMock()
    current_user.id = 1
    
    with pytest.raises(HTTPException) as exc_info:
        check_model(current_user, None)
    
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Model not found"

def test_check_model_raises_403_when_user_id_differs():
    current_user = MagicMock()
    current_user.id = 1
    
    model = MagicMock()
    model.user_id = 2  # distinto usuario
    
    with pytest.raises(HTTPException) as exc_info:
        check_model(current_user, model)
    
    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Access denied"
