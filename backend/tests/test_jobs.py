def test_list_sample_jobs(client):
    response = client.get("/api/v1/jobs")
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) >= 1
    assert jobs[0]["is_sample"] is True

def test_match_job_listing(client, auth_headers):
    jobs = client.get("/api/v1/jobs").json()
    job_id = jobs[0]["id"]

    match_resp = client.get(f"/api/v1/jobs/{job_id}/match", headers=auth_headers)
    assert match_resp.status_code == 200
    data = match_resp.json()
    assert "compatibility_score" in data
    assert "matched_skills" in data
    assert "tailoring_advice" in data

def test_custom_job_match(client, auth_headers):
    custom_jd = """
    We are seeking a Backend Engineer with strong expertise in Python, FastAPI, and Docker.
    Must understand SQL databases and REST APIs.
    """
    response = client.post("/api/v1/jobs/match", headers=auth_headers, json={
        "job_title": "Backend Python Developer",
        "company_name": "NextGen Labs",
        "job_description": custom_jd
    })
    assert response.status_code == 200
    data = response.json()
    assert data["job_title"] == "Backend Python Developer"
    assert "compatibility_score" in data

def test_save_and_track_job(client, auth_headers):
    jobs = client.get("/api/v1/jobs").json()
    job_id = jobs[0]["id"]

    save_resp = client.post(f"/api/v1/jobs/{job_id}/save", headers=auth_headers, json={
        "status": "applied",
        "notes": "Applied via referral"
    })
    assert save_resp.status_code == 200
    saved = save_resp.json()
    assert saved["status"] == "applied"
    saved_id = saved["id"]

    list_resp = client.get("/api/v1/jobs/saved", headers=auth_headers)
    assert list_resp.status_code == 200
    assert any(s["id"] == saved_id for s in list_resp.json())

    patch_resp = client.patch(f"/api/v1/jobs/saved/{saved_id}?status=interviewing", headers=auth_headers)
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "interviewing"

    del_resp = client.delete(f"/api/v1/jobs/saved/{saved_id}", headers=auth_headers)
    assert del_resp.status_code == 204

def test_save_custom_job(client, auth_headers):
    payload = {
        "custom_title": "Lead Software Architect",
        "custom_company": "Anthropic",
        "custom_location": "San Francisco, CA",
        "status": "applied",
        "notes": "Applied on direct careers portal"
    }
    save_resp = client.post("/api/v1/jobs/saved", headers=auth_headers, json=payload)
    assert save_resp.status_code == 200
    saved = save_resp.json()
    assert saved["custom_title"] == "Lead Software Architect"
    assert saved["custom_company"] == "Anthropic"
    assert saved["job_id"] is None
    assert saved["status"] == "applied"

