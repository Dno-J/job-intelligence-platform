# JobIntel — Job Intelligence Platform

> A full-stack job intelligence platform that scrapes jobs, extracts skills, analyzes market demand, recommends relevant roles, and tracks job applications through a production-style workflow.

JobIntel is a full-stack career intelligence application built with **FastAPI, React, PostgreSQL, Redis, Celery, Docker, and Tailwind CSS**.

The platform collects job listings from multiple sources, processes them through background workers, extracts technical skills, stores structured data in PostgreSQL, and provides a modern frontend for job search, analytics, personalized recommendations, resume analysis, skill gap analysis, and application tracking.

---

## Motivation

Most job seekers browse job boards manually without understanding the actual hiring market.

They may know which roles they want, but not:

- which skills are appearing most often,
- which companies are hiring actively,
- how their resume compares with market demand,
- which saved jobs they have already applied to,
- or which roles best match their profile.

JobIntel solves this by turning raw scraped job listings into a searchable, personalized, and analytics-driven job intelligence workflow.

The project was built to demonstrate full-stack engineering, backend architecture, asynchronous processing, database design, frontend product thinking, testing, deployment preparation, and real-world career-tech use cases.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [System Workflow](#system-workflow)
- [Tech Stack](#tech-stack)
- [Key Files and Responsibilities](#key-files-and-responsibilities)
- [Screenshots](#screenshots)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Useful Commands](#useful-commands)
- [Skill Backfill](#skill-backfill)
- [Testing](#testing)
- [API Overview](#api-overview)
- [Deployment Notes](#deployment-notes)
- [Manual Job Refresh](#manual-job-refresh)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [Why This Project Matters](#why-this-project-matters)
- [Development Note](#development-note)
- [Author](#author)

---

## Project Overview

JobIntel is more than a job board.

It combines:

- job scraping,
- background processing,
- skill extraction,
- analytics,
- authentication,
- profile-based personalization,
- resume analysis,
- skill gap analysis,
- application tracking,
- and admin-only manual job refresh for lightweight production deployment.

The application allows users to browse jobs, save them, receive personalized recommendations, analyze their resume against market demand, track applications, and understand job market trends using scraped job data.

---

## Core Features

### 1. Job Discovery

Users can:

- browse scraped job listings,
- search jobs by keyword,
- filter by location,
- filter by job type,
- filter by experience level,
- sort by latest, salary, and title,
- view detailed job information,
- and save jobs for tracking.

---

### 2. Market Analytics Dashboard

The dashboard visualizes job market trends using scraped job data.

It includes:

- top in-demand skills,
- top hiring companies,
- job posting trends over time,
- date range filters,
- skill-based filtering,
- trend/date-based filtering,
- and summary cards for quick insights.

---

### 3. Authentication

The platform includes JWT-based authentication.

Users can:

- register,
- login,
- access protected pages,
- manage their profile,
- save jobs,
- receive personalized recommendations,
- and track job applications.

---

### 4. Career Profile

Users can build a career profile containing:

- full name,
- headline,
- target role,
- experience level,
- preferred location,
- preferred job type,
- skills,
- GitHub URL,
- LinkedIn URL,
- portfolio URL,
- resume URL,
- and bio.

This profile powers personalized recommendations and improves career insights.

---

### 5. Personalized Job Recommendations

JobIntel recommends jobs based on user profile signals such as:

- target role,
- skills,
- preferred location,
- preferred job type,
- and experience level.

Each recommended job can include:

- match score,
- matched skills,
- recommendation reasons,
- and direct save/apply actions.

---

### 6. Application Tracker

Saved jobs become part of an application tracker.

Users can move jobs through statuses:

- Saved
- Applied
- Interviewing
- Offer
- Rejected

Users can also:

- add notes,
- track application progress,
- view status counts,
- filter by status,
- and manage their job search workflow.

---

### 7. Resume Analyzer

Users can upload a PDF resume.

The system:

- extracts resume text,
- detects technical skills,
- compares resume skills against market demand,
- calculates a match score,
- shows matched skills,
- shows missing skills,
- and recommends skills to improve.

---

### 8. Skill Gap Analyzer

Users can enter their current skills.

The system compares those skills against the most in-demand market skills and returns:

- match score,
- matched skills,
- missing market skills,
- and recommended skills to learn.

---

### 9. Background Processing

The platform uses Redis and Celery for asynchronous processing in local development.

Background tasks handle:

- job processing,
- skill extraction,
- job cleanup,
- scheduled tasks,
- and skill backfilling for existing jobs.

The production demo is designed to remain lightweight by avoiding always-running scraper and worker containers unless continuous updates are required.

---

### 10. Admin-Only Manual Job Refresh

JobIntel includes an admin-only manual scrape endpoint.

This allows the project owner to refresh job data on demand without running scraper containers, Redis, or Celery workers continuously in the deployed demo.

---

## Architecture

```txt
External Job Sources
        |
        v
Scraper Services / Manual Admin Scrape
        |
        v
Job Processing + Skill Extraction
        |
        v
PostgreSQL Database
        |
        v
FastAPI Backend
        |
        v
React Frontend
```

### Local Development Architecture

```txt
External Job Sources
        |
        v
Scraper Services
        |
        v
Redis Queue
        |
        v
Celery Worker
        |
        v
PostgreSQL Database
        |
        v
FastAPI Backend
        |
        v
React Frontend
```

### Lightweight Deployment Architecture

```txt
External Job Source
        |
        v
Admin-Only Manual Scrape Endpoint
        |
        v
Hosted PostgreSQL Database
        |
        v
FastAPI Backend
        |
        v
React Frontend
```

---

## System Workflow

1. Scraper services collect jobs from external sources during local development.
2. Scraped jobs are sent into a Redis-backed queue.
3. Celery workers process jobs asynchronously.
4. Workers clean job data, normalize fields, deduplicate records, and extract skills.
5. PostgreSQL stores users, profiles, jobs, companies, skills, saved jobs, and job-skill relationships.
6. FastAPI exposes APIs for jobs, analytics, authentication, profiles, recommendations, saved jobs, career tools, and admin-only manual refresh.
7. React displays the user-facing product with dashboards, search, recommendations, tracker workflows, and analysis tools.
8. In the deployed demo, continuous scraper/worker services can be replaced with seeded data and manual admin-triggered refreshes.

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Chart.js
- React Chart.js 2
- Framer Motion

### Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- JWT authentication
- Passlib / bcrypt
- Python

### Background Services

- Redis
- Celery
- Celery Beat

### Scraping

- Python
- Requests
- BeautifulSoup

### Testing

- Pytest
- FastAPI TestClient
- HTTPX

### DevOps / Infrastructure

- Docker
- Docker Compose
- Environment-based configuration
- Render-ready backend configuration
- Neon PostgreSQL-ready database configuration

---

## Key Files and Responsibilities

### Backend — `fastapi_service`

- `fastapi_service/main.py`  
  Creates the FastAPI app, configures CORS, registers routers, and exposes health endpoints.

- `fastapi_service/database.py`  
  Configures the SQLAlchemy engine, database session, and declarative base.

- `fastapi_service/dependencies.py`  
  Provides shared FastAPI dependencies such as database sessions.

- `fastapi_service/core/security.py`  
  Handles password hashing, password verification, JWT generation, and authentication security settings.

- `fastapi_service/api/auth.py`  
  Handles registration, login, current user lookup, and JWT authentication.

- `fastapi_service/api/jobs.py`  
  Handles job search, job detail lookup, and personalized recommended jobs.

- `fastapi_service/api/profile.py`  
  Handles user career profile retrieval and updates.

- `fastapi_service/api/saved_jobs.py`  
  Handles saved jobs, application tracker updates, notes, statuses, and tracker stats.

- `fastapi_service/api/analytics.py`  
  Handles dashboard analytics, top skills, skill gap analysis, and resume analysis.

- `fastapi_service/api/companies.py`  
  Handles company listing and company-level job counts.

- `fastapi_service/api/admin.py`  
  Provides admin-only manual job refresh through `POST /admin/scrape-once`.

- `fastapi_service/services/job_service.py`  
  Contains reusable job query, filtering, sorting, serialization, and lookup logic.

- `fastapi_service/services/recommendation_service.py`  
  Scores jobs against user profile data and generates recommendation reasons.

- `fastapi_service/services/analytics_service.py`  
  Builds dashboard data, market skill insights, resume analysis, and skill gap results.

- `fastapi_service/services/manual_scraper_service.py`  
  Handles direct admin-triggered job scraping, deduplication, company creation, job insertion, skill extraction, and job-skill linking without requiring Celery or Redis.

- `fastapi_service/models/`  
  Contains SQLAlchemy models for users, profiles, jobs, companies, skills, saved jobs, and cleanup logs.

- `fastapi_service/schemas/`  
  Contains Pydantic request and response models.

- `fastapi_service/tests/`  
  Contains backend API tests for health, authentication, profile, jobs, saved jobs, tracker behavior, analytics, and admin route protection.

---

### Worker — `worker_service`

- `worker_service/celery_app.py`  
  Configures Celery, Redis broker/backend, task routing, and scheduled tasks.

- `worker_service/cleanup_tasks.py`  
  Marks old jobs inactive and deletes very old inactive jobs.

- `worker_service/skill_extractor.py`  
  Extracts normalized technical skills from job titles and descriptions.

- `worker_service/backfill_skills.py`  
  Rebuilds job-skill links for existing jobs using the current skill extractor.

- `worker_service/wait_for_db.py`  
  Waits for PostgreSQL before starting worker processes.

---

### Scrapers — `scraper_service`

- `scraper_service/remoteok_scraper.py`  
  Scrapes jobs from RemoteOK.

- `scraper_service/remotive_scraper.py`  
  Scrapes jobs from Remotive.

- `scraper_service/arbeitnow_scraper.py`  
  Scrapes jobs from Arbeitnow.

- `scraper_service/internshala_scraper.py`  
  Scrapes internships from Internshala.

- `scraper_service/redis_queue.py`  
  Contains Redis queue helper logic.

---

### Frontend — `frontend/src`

- `frontend/src/App.jsx`  
  Main router, protected routes, navbar, and app layout.

- `frontend/src/services/api.js`  
  Central Axios API client with JWT token injection and API helper functions.

- `frontend/src/context/AuthContext.jsx`  
  Manages authenticated user state across the frontend.

- `frontend/src/context/AnalyticsContext.jsx`  
  Stores dashboard filter state such as skill, date, and range.

- `frontend/src/pages/Home.jsx`  
  Product landing page explaining the platform, architecture, features, and workflow.

- `frontend/src/pages/Dashboard.jsx`  
  Analytics dashboard for market insights.

- `frontend/src/pages/Jobs.jsx`  
  Searchable and filterable job listing page.

- `frontend/src/pages/RecommendedJobs.jsx`  
  Personalized job recommendation page.

- `frontend/src/pages/SavedJobs.jsx`  
  Application tracker with statuses and notes.

- `frontend/src/pages/Profile.jsx`  
  Career profile and recommendation signals page.

- `frontend/src/pages/Tools.jsx`  
  Resume analyzer and skill gap tools page.

- `frontend/src/components/SkillsChart.jsx`  
  Skill demand chart.

- `frontend/src/components/CompaniesChart.jsx`  
  Top companies chart.

- `frontend/src/components/TrendsChart.jsx`  
  Job trends chart.

- `frontend/src/components/ProtectedRoute.jsx`  
  Protects authenticated pages.

---

## Screenshots

Below are screenshots from the running application.

### Home Page

![Home Page](screenshots/home.png)

---

### Market Analytics Dashboard

![Dashboard](screenshots/dashboard.png)

---

### Jobs Page

![Jobs Page](screenshots/jobs.png)

---

### Recommended Jobs

![Recommended Jobs](screenshots/recommended-jobs.png)

---

### Application Tracker

![Application Tracker](screenshots/application-tracker.png)

---

### Profile

![Profile](screenshots/profile.png)

---

### Career Tools

![Career Tools](screenshots/tools.png)

---

### FastAPI Swagger Docs

![API Docs](screenshots/api-docs.png)

---

## Local Development Setup

### Prerequisites

Make sure you have installed:

- Docker
- Docker Compose
- Node.js
- npm
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/job-intelligence-platform.git
cd job-intelligence-platform
```

Replace the clone URL with the actual GitHub repository URL after publishing.

---

### 2. Create Environment Files

Copy the root environment example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Create the frontend environment file:

```bash
cd frontend
cp .env.example .env
cd ..
```

On Windows PowerShell:

```powershell
Copy-Item frontend/.env.example frontend/.env
```

---

### 3. Start Backend Services

From the project root:

```bash
docker compose up --build
```

This starts:

- PostgreSQL
- Redis
- FastAPI
- Celery worker
- Celery Beat
- scraper services

Backend URL:

```txt
http://localhost:8001
```

Swagger API docs:

```txt
http://localhost:8001/docs
```

Health check:

```txt
http://localhost:8001/health
```

---

### 4. Start Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```txt
http://localhost:5173
```

---

## Environment Variables

### Root `.env`

Create this file from `.env.example`.

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=jobs_db
POSTGRES_PORT=5432

# SQLAlchemy database URL
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/jobs_db

# Redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379/0

# FastAPI
FASTAPI_PORT=8001
SECRET_KEY=change-this-secret-before-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ADMIN_SECRET_KEY=change-this-admin-secret-before-production
```

---

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8001
```

---

### Production Environment Variables

For production, update these values:

```env
DATABASE_URL=your-production-postgres-url
SECRET_KEY=your-long-random-production-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=https://your-frontend-domain.com
ADMIN_SECRET_KEY=your-long-random-admin-secret
VITE_API_URL=https://your-backend-domain.com
```

Do not commit real `.env` files.

Only commit `.env.example` files.

---

## Useful Commands

### Start all Docker services

```bash
docker compose up --build
```

### Stop Docker services

```bash
docker compose down
```

### Stop services and delete database volume

```bash
docker compose down -v
```

> Warning: this deletes local PostgreSQL data.

### Restart FastAPI

```bash
docker compose restart fastapi
```

### Restart worker

```bash
docker compose restart worker
```

### View all logs

```bash
docker compose logs -f
```

### View FastAPI logs

```bash
docker compose logs -f fastapi
```

### View worker logs

```bash
docker compose logs -f worker
```

### Open PostgreSQL shell

```bash
docker compose exec postgres psql -U postgres -d jobs_db
```

### Run backend tests

```bash
docker compose exec fastapi pytest
```

### Run frontend dev server

```bash
cd frontend
npm run dev
```

### Build frontend

```bash
cd frontend
npm run build
```

---

## Skill Backfill

When the skill extractor is updated, existing jobs can be reprocessed using the skill backfill task.

Run:

```bash
docker compose exec worker celery -A celery_app call backfill_job_skills --args='[1000, true]'
```

Then check worker logs:

```bash
docker compose logs -f worker
```

Verify top extracted skills:

```bash
docker compose exec postgres psql -U postgres -d jobs_db
```

```sql
SELECT s.normalized_name, COUNT(js.id) AS usage_count
FROM jobs_jobskill js
JOIN jobs_skill s ON js.skill_id = s.id
GROUP BY s.normalized_name
ORDER BY usage_count DESC
LIMIT 20;
```

---

## Testing

Backend API tests have been added using `pytest` and FastAPI `TestClient`.

Current covered areas:

- Health endpoints
- Root endpoint
- User registration
- Duplicate email validation
- Login
- Invalid login
- Current user endpoint
- Protected endpoint behavior
- Profile retrieval
- Profile update
- Job listing
- Job filters
- Job pagination
- Job detail lookup
- Saved jobs authentication protection
- Save job
- Duplicate save behavior
- Saved jobs listing
- Saved jobs stats
- Application status update
- Application notes update
- Status filtering
- Remove saved job
- Dashboard analytics smoke test
- Top skills analytics smoke test
- Skill gap endpoint smoke test
- Admin scrape route protection tests

Run tests:

```bash
docker compose exec fastapi pytest
```

Expected result:

```txt
36 passed
```

Current warnings are related to future framework cleanup:

- Pydantic V2 `Config` deprecation warnings
- FastAPI `on_event` lifespan deprecation warning
- Passlib internal warning

These do not currently block local development or deployment.

---

## API Overview

FastAPI automatically provides Swagger documentation at:

```txt
http://localhost:8001/docs
```

### Auth

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Jobs

```txt
GET /jobs
GET /jobs/{job_id}
GET /jobs/recommended
```

### Profile

```txt
GET /profile/me
PUT /profile/me
```

### Saved Jobs / Application Tracker

```txt
GET    /saved-jobs
GET    /saved-jobs/stats
POST   /saved-jobs/{job_id}
PATCH  /saved-jobs/{job_id}
DELETE /saved-jobs/{job_id}
```

### Analytics

```txt
GET  /analytics/dashboard
GET  /analytics/top-skills
POST /analytics/skill-gap
POST /analytics/resume-analyze
```

### Companies

```txt
GET /companies/
```

### Admin

```txt
POST /admin/scrape-once
```

### Health

```txt
GET /health
```

---

## Deployment Notes

The deployed demo is designed to run as a lightweight production-style setup:

- Frontend hosted as a static site
- FastAPI backend hosted as a web service
- PostgreSQL hosted on a managed database provider
- Continuous scraper/worker services kept outside the always-on deployment

This keeps the public demo stable and cost-efficient while preserving the full local development architecture with Redis, Celery, and scraper services.

---

### Backend Deployment

FastAPI can be started locally with:

```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

For platforms that provide a dynamic `PORT` environment variable, use:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Production backend environment variables:

```env
DATABASE_URL=your-production-postgres-url
SECRET_KEY=your-production-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=https://your-frontend-url.com
ADMIN_SECRET_KEY=your-production-admin-secret
```

---

### Frontend Deployment

Set:

```env
VITE_API_URL=https://your-backend-url.com
```

Build command:

```bash
npm run build
```

Output directory:

```txt
dist
```

---

### Database Deployment

A managed PostgreSQL database is recommended for the hosted deployment.

After creating the production database:

1. Copy the database connection string.
2. Set it as `DATABASE_URL` in the backend hosting environment.
3. Make sure SSL is supported by the connection string if required by the provider.
4. Start the backend once so SQLAlchemy can create tables.
5. Seed or manually refresh enough job data for the public demo.

---

### Worker and Scraper Deployment

The project includes Celery workers, Celery Beat, Redis, and scraper services for local development and future continuous ingestion.

For the lightweight deployed demo, these services are not required to run continuously.

The initial deployment approach is:

- deploy the backend and frontend,
- use a managed PostgreSQL database,
- seed jobs before demo,
- refresh jobs manually through an admin-only endpoint,
- deploy worker/scraper services later if continuous updates are needed.

---

### Cold Start Note

Depending on the hosting plan, the backend may cold start after inactivity.

The frontend includes loading states so the app remains usable while the backend wakes up.

---

## Manual Job Refresh

The deployed demo does not need continuously running scraper containers, Redis, or Celery workers.

Instead, the backend includes an admin-only manual refresh endpoint:

```txt
POST /admin/scrape-once
```

The endpoint is protected using the `X-Admin-Secret` header.

Example:

```bash
curl -X POST "https://your-backend-url.com/admin/scrape-once?source=arbeitnow&limit=50" \
  -H "X-Admin-Secret: your-admin-secret"
```

Currently, the deployment-safe manual scrape endpoint supports:

```txt
source=arbeitnow
```

This allows the project owner to refresh jobs manually without keeping background scrapers running continuously.

This design keeps the deployment lightweight while preserving the ability to refresh job data when needed.

---

## Limitations

- The recommendation engine is rule-based, not a trained machine learning model.
- Skill extraction is rule-based and depends on the maintained skill list.
- Scraper reliability depends on external websites and APIs.
- No Alembic migration system is implemented yet.
- Frontend automated tests are not yet implemented.
- Resume analysis depends on PDF text extraction quality.
- Continuous worker/scraper deployment requires additional hosted services.
- The manual deployment-safe scrape endpoint currently supports Arbeitnow only.
- The app is designed for learning, portfolio, and demo purposes, not as a commercial job platform yet.

---

## Future Improvements

Planned improvements include:

- Alembic database migrations
- Expanded backend unit tests
- Frontend component tests
- End-to-end tests
- Better scraper scheduling
- Scraper health monitoring
- Admin dashboard
- More sources for manual scrape refresh
- Kanban-style application tracker
- Email reminders for follow-ups
- Interview date tracking
- Resume-to-specific-job matching
- AI-generated resume improvement suggestions
- Improved skill extraction using NLP
- Production logging
- Monitoring
- Rate limiting
- CI/CD pipeline
- Deployment automation

---

## Why This Project Matters

JobIntel demonstrates practical full-stack engineering beyond simple CRUD.

It includes:

- backend API design
- relational database modeling
- authentication
- protected user workflows
- background task processing
- Redis/Celery architecture
- scraping pipelines
- analytics queries
- data visualization
- recommendation logic
- resume analysis
- profile-based personalization
- application tracking
- Docker-based local development
- automated backend API tests
- admin-only manual job refresh for lightweight deployment
- and production-minded environment configuration

This project shows the ability to build, connect, debug, test, polish, and explain a realistic multi-service application.

---

## Development Note

AI tools were used as an assistant for code review, refactoring suggestions, debugging support, and documentation polish.

Core architecture decisions, implementation, testing, integration, and deployment verification were completed and reviewed by me.

---

## Author

Built by **Dino Jackson**.

- GitHub: [https://github.com/Dno-J](https://github.com/Dno-J)
- LinkedIn: [https://www.linkedin.com/in/dino-jackson-486840368/](https://www.linkedin.com/in/dino-jackson-486840368/)
- Portfolio: [https://portfolio-frontend-wy8a.onrender.com/](https://portfolio-frontend-wy8a.onrender.com/)
