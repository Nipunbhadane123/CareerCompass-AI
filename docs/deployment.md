# CareerCompass AI — Deployment & Operations Guide

## 1. Local Development Setup

### 1.1 Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- (Optional) Docker and Docker Compose

### 1.2 Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.main
```
The FastAPI server will be available at `http://localhost:8000`. Interactive Swagger API docs are available at `http://localhost:8000/docs`.

### 1.3 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will be available at `http://localhost:5173`.

---

## 2. Docker & Containerized Deployment

Run the complete stack with a single command using Docker Compose:
```bash
docker-compose up --build
```
This launches:
- **Frontend SPA**: Nginx serving optimized static build on port 80 / 3000.
- **Backend API**: Uvicorn running FastAPI on port 8000.
- **PostgreSQL**: Production-grade relational database on port 5432.
- **Persistent Volume**: Preserves database storage and resume file uploads.
