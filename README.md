# geosapiens-challenge

This workspace is meant to be a monorepo with two top-level folders:

- `backend/`: Spring Boot (Java 21) + Flyway + PostgreSQL
- `frontend/`: web app (to be added)

## Run locally

1. Start PostgreSQL:

```powershell
cd backend
docker compose up -d
```

2. Run the backend:

```powershell
cd backend
.\mvnw spring-boot:run
```

Defaults (from `backend/docker-compose.yml` and `backend/src/main/resources/application.yml`):

- Backend: `http://localhost:8080`
- Postgres: `localhost:5432` (db `geosapiens`, user `admin`, password `admin`)

## Convert to a single Git repo (monorepo)

Right now, `backend/` is a separate Git repo and `frontend/` is an empty Git repo, while the root folder is not a Git repo.

If you want a single Git repo at the root:

```powershell
.\scripts\convert-to-monorepo.ps1
```

This moves `backend/.git` and `frontend/.git` into `.git-backup/`, initializes Git at the root, and stages everything.

Then add your remote and push:

```powershell
git remote add origin <YOUR_REPO_URL>
git branch -M main
git push -u origin main
```

