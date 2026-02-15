# geosapiens-challenge

This workspace is meant to be a monorepo with two top-level folders:

- `backend/`: Spring Boot (Java 21) + Flyway + PostgreSQL
- `frontend/`: React SPA

## Run locally

Start the full stack (db + backend + frontend):

```powershell
docker compose up --build
```

Defaults (from `docker-compose.yml` and `backend/src/main/resources/application.yml`):

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080` (API)
- Postgres: `localhost:5432` (db `geosapiens`, user `admin`, password `admin`)
