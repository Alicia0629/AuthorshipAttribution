from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_app_routers():
    routes = [route.path for route in app.routes]
    assert any(route.startswith("/users") for route in routes), "No hay rutas que comiencen con '/users'"
    assert any(route.startswith("/auth") for route in routes), "No hay rutas que comiencen con '/auth'"
    assert any(route.startswith("/model") for route in routes), "No hay rutas que comiencen con '/model'"

def test_app_metadata():
    assert app.title == "FastAPI"
    assert app.openapi_url == "/openapi.json"