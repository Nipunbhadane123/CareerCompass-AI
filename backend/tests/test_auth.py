def test_register_new_user(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "newgraduate@careercompass.ai",
        "password": "Password123!",
        "full_name": "Jordan Smith"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newgraduate@careercompass.ai"

def test_register_duplicate_email(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "testuser@careercompass.ai",
        "password": "Password123!",
        "full_name": "Duplicate User"
    })
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_login_success(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "testuser@careercompass.ai",
        "password": "TestPassword123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_password(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "testuser@careercompass.ai",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401

def test_get_current_user_profile(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testuser@careercompass.ai"

def test_protected_route_unauthenticated(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
