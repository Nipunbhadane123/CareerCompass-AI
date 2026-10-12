import io

def test_resume_upload_and_analysis(client, auth_headers):
    sample_resume_content = b"""
    ALEX CHEN
    alex.chen@example.com | (555) 123-4567 | github.com/alexchen | linkedin.com/in/alexchen

    EDUCATION
    Bachelor of Science in Computer Science, State University, 2025. GPA: 3.8/4.0

    SKILLS
    Languages: Python, JavaScript, TypeScript, SQL, HTML, CSS
    Frameworks: React, FastAPI, Node.js
    Databases: PostgreSQL, Redis
    Tools: Docker, Git, Linux

    EXPERIENCE
    Software Engineering Intern | TechCorp (2024)
    - Engineered high-throughput REST APIs using FastAPI and PostgreSQL, serving 15,000+ daily requests.
    - Optimized database queries, achieving a 35% latency reduction.
    - Collaborated with product managers to deliver user onboarding flow.

    PROJECTS
    Full-Stack Cloud Dashboard
    - Developed responsive client in React and TypeScript with Tailwind CSS.
    - Automated deployment with Docker containers on AWS.
    """

    files = {
        "file": ("resume.txt", sample_resume_content, "text/plain")
    }

    response = client.post("/api/v1/resumes/upload", headers=auth_headers, files=files)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["filename"] == "resume.txt"
    assert data["latest_analysis"] is not None
    assert data["latest_analysis"]["ats_score"] >= 60
    assert len(data["latest_analysis"]["strengths"]) >= 1
    assert len(data["latest_analysis"]["recommendations"]) >= 1

    resume_id = data["id"]

    # Test get resume by ID
    get_resp = client.get(f"/api/v1/resumes/{resume_id}", headers=auth_headers)
    assert get_resp.status_code == 200

    # Test update analysis
    update_resp = client.put(f"/api/v1/resumes/{resume_id}/analysis", headers=auth_headers, json={
        "summary": "Updated executive candidate summary for senior engineering roles."
    })
    assert update_resp.status_code == 200
    assert update_resp.json()["summary"] == "Updated executive candidate summary for senior engineering roles."

    # Test delete resume
    del_resp = client.delete(f"/api/v1/resumes/{resume_id}", headers=auth_headers)
    assert del_resp.status_code == 204
