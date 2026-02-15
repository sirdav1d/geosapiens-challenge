# geosapiens-challenge

This workspace is meant to be a monorepo with two top-level folders:

- `backend/`: Spring Boot (Java 21) + Flyway + PostgreSQL
- `frontend/`: React SPA

## Run locally

Start the full stack (db + backend + frontend):

```powershell
docker compose up --build
```

Required environment variables (set them via a root `.env`, see `.env.example`):

- `POSTGRES_IMAGE`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `BACKEND_PORT`
- `FRONTEND_PORT`
- `VITE_API_URL`
- `APP_SEED`
- `CORS_ALLOWED_ORIGINS`

URLs depend on your port mapping:

- Frontend: `http://localhost:<FRONTEND_PORT>`
- Backend: `http://localhost:<BACKEND_PORT>` (API)
