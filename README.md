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
