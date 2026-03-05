from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to DESTINY AI API"}

def test_analyze_logic():
    # Test high scores
    payload = {
        "life_line_score": 9,
        "head_line_score": 9,
        "heart_line_score": 9
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["cognitive_profile"]["resilience"] == "High"
    
    # Test moderate scores
    payload_mod = {
        "life_line_score": 5,
        "head_line_score": 5,
        "heart_line_score": 5
    }
    response_mod = client.post("/analyze", json=payload_mod)
    assert response_mod.status_code == 200
    data_mod = response_mod.json()
    assert data_mod["cognitive_profile"]["resilience"] == "Moderate"

def test_chat_no_context():
    payload = {"message": "Tell me my future"}
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    assert "cannot see your path clearly" in response.json()["response"]
