from fastapi.testclient import TestClient

def test_generate_interview_session(client: TestClient, auth_headers: dict):
    payload = {
        "role_title": "Full-Stack Software Engineer",
        "company": "Stripe",
        "difficulty": "Mid-Level",
        "focus_skills": ["Python", "React", "PostgreSQL", "Docker"],
        "question_count": 5
    }
    response = client.post(
        "/api/v1/interviews/generate",
        json=payload,
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["role_title"] == "Full-Stack Software Engineer"
    assert data["company"] == "Stripe"
    assert len(data["questions"]) >= 3
    assert data["practiced_count"] == 0
    assert data["readiness_percentage"] == 0

    first_q = data["questions"][0]
    assert "question_text" in first_q
    assert "suggested_answer_points" in first_q
    assert "star_guidance" in first_q
    assert "pitfalls_to_avoid" in first_q
    assert first_q["is_practiced"] is False

def test_list_and_update_interview_session(client: TestClient, auth_headers: dict):
    # 1. Generate session
    gen_resp = client.post(
        "/api/v1/interviews/generate",
        json={"role_title": "Backend Platform Engineer", "difficulty": "Senior", "question_count": 4},
        headers=auth_headers
    )
    assert gen_resp.status_code == 201
    session_id = gen_resp.json()["id"]
    question_id = gen_resp.json()["questions"][0]["id"]

    # 2. List sessions
    list_resp = client.get("/api/v1/interviews", headers=auth_headers)
    assert list_resp.status_code == 200
    sessions = list_resp.json()
    assert any(s["id"] == session_id for s in sessions)

    # 3. Update question progress
    patch_resp = client.patch(
        f"/api/v1/interviews/questions/{question_id}",
        json={"is_practiced": True, "mastery_rating": 4, "user_notes": "Mentioned GIL and asyncio event loop."},
        headers=auth_headers
    )
    assert patch_resp.status_code == 200
    updated_q = patch_resp.json()
    assert updated_q["is_practiced"] is True
    assert updated_q["mastery_rating"] == 4
    assert "Mentioned GIL" in updated_q["user_notes"]

    # 4. Check session readiness updated
    detail_resp = client.get(f"/api/v1/interviews/{session_id}", headers=auth_headers)
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["practiced_count"] == 1
    assert detail["readiness_percentage"] > 0
