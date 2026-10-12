def test_list_roles(client):
    response = client.get("/api/v1/careers/roles")
    assert response.status_code == 200
    roles = response.json()
    assert len(roles) >= 1
    assert any(r["title"] == "Full-Stack Software Engineer" for r in roles)

def test_get_role_details(client):
    response = client.get("/api/v1/careers/roles")
    role_id = response.json()[0]["id"]

    detail_resp = client.get(f"/api/v1/careers/roles/{role_id}")
    assert detail_resp.status_code == 200
    data = detail_resp.json()
    assert "skills" in data

def test_career_recommendations(client, auth_headers):
    # Set user profile skills first
    update_resp = client.put("/api/v1/users/profile", headers=auth_headers, json={
        "skills": ["Python", "React", "SQL"],
        "years_of_experience": 1.0,
        "education_level": "Bachelor's in CS"
    })
    assert update_resp.status_code == 200

    rec_resp = client.get("/api/v1/careers/recommendations", headers=auth_headers)
    assert rec_resp.status_code == 200
    recs = rec_resp.json()
    assert len(recs) >= 1
    top_rec = recs[0]
    assert "match_score" in top_rec
    assert top_rec["match_score"] > 50
    assert "Python" in top_rec["matched_skills"]

def test_role_gap_analysis(client, auth_headers):
    roles = client.get("/api/v1/careers/roles").json()
    role_id = roles[0]["id"]

    gap_resp = client.get(f"/api/v1/careers/gap-analysis/{role_id}", headers=auth_headers)
    assert gap_resp.status_code == 200
    data = gap_resp.json()
    assert "overall_match_score" in data
    assert "skills_breakdown" in data
    assert len(data["skills_breakdown"]) >= 1
