def test_generate_and_track_roadmap(client, auth_headers):
    # 1. Generate roadmap
    resp = client.post("/api/v1/learning/roadmaps/generate", headers=auth_headers, json={
        "target_role": "Full-Stack Software Engineer",
        "pace": "moderate"
    })
    assert resp.status_code == 201
    roadmap = resp.json()
    assert roadmap["target_role"] == "Full-Stack Software Engineer"
    assert len(roadmap["steps"]) >= 3
    roadmap_id = roadmap["id"]
    step_id = roadmap["steps"][0]["id"]
    assert roadmap["progress_percentage"] == 0

    # 2. Toggle step completion
    toggle_resp = client.patch(f"/api/v1/learning/steps/{step_id}/toggle", headers=auth_headers)
    assert toggle_resp.status_code == 200
    toggle_data = toggle_resp.json()
    assert toggle_data["is_completed"] is True
    assert toggle_data["roadmap_progress_percentage"] > 0

    # 3. Retrieve updated roadmap
    get_resp = client.get(f"/api/v1/learning/roadmaps/{roadmap_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["progress_percentage"] > 0

    # 4. Clean up delete
    del_resp = client.delete(f"/api/v1/learning/roadmaps/{roadmap_id}", headers=auth_headers)
    assert del_resp.status_code == 204
