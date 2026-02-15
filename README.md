# geosapiens-challenge

This workspace is meant to be a monorepo with two top-level folders:

- `backend/`: Spring Boot (Java 21) + Flyway + PostgreSQL
- `frontend/`: React SPA

## Run locally

Start the full stack (db + backend + frontend):

```powershell
docker compose --env-file .env.example up --build
```

Why `--env-file .env.example`?

- We intentionally do not keep default/fallback values in `docker-compose.yml` and `backend/src/main/resources/application.yml` to avoid leaking configuration via code/commits.
- The real `.env` is gitignored (so it won't exist in a clean clone).
- For evaluation and local dev, `.env.example` provides non-secret local values and is used explicitly via `--env-file`.

Required environment variables (already filled in `.env.example`):

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

Default local URLs (from `.env.example`):

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080` (API)
