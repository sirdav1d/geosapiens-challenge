# geosapiens-challenge

Este repositório é um monorepo com duas pastas principais:

- `backend/`: Spring Boot (Java 21) + Flyway + PostgreSQL
- `frontend/`: SPA em React (Vite + TypeScript)

## Pré-requisitos

- Docker + Docker Compose (ex.: Docker Desktop)

## Rodar localmente

Suba o stack completo (db + backend + frontend) a partir da raiz do repositório:

```powershell
docker compose --env-file .env.example up --build
```

Por que `--env-file .env.example`?

- Não mantemos valores default/fallback em `docker-compose.yml` e `backend/src/main/resources/application.yml` para evitar "vazar" configurações via código/commits.
- O `.env` real é ignorado pelo Git (então não vai existir num clone limpo).
- Para avaliação e desenvolvimento local, o `.env.example` contém valores não secretos e é carregado explicitamente com `--env-file`.

Variáveis de ambiente necessárias (já preenchidas em `.env.example`):

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

URLs locais padrão (do `.env.example`):

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080` (API)

## Comandos úteis

Parar os containers:

```powershell
docker compose --env-file .env.example down
```

Resetar o banco (remove volumes):

```powershell
docker compose --env-file .env.example down -v
```
