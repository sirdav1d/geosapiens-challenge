<!-- @format -->

# geosapiens-challenge

Monorepo com aplicação full stack para gerenciamento de ativos (assets), contendo:

- `backend/`: API REST em Spring Boot (Java 21), PostgreSQL e Flyway.
- `frontend/`: SPA em React (Vite + TypeScript).

## Objetivo

Permitir listar, filtrar, buscar, paginar e gerenciar ativos (criar, editar e excluir) com:

- API REST com validações e códigos HTTP consistentes.
- Frontend consumindo paginação/filtros/busca do backend.
- Execução local plug and play via Docker Compose.

## Pré-requisitos

- Docker Desktop (ou Docker Engine + Docker Compose plugin) instalado.
- Não é necessário ter Java, Maven, Node.js ou pnpm instalados localmente.

## Execução local (plug and play)

1. Na raiz do projeto, suba todo o stack:

```bash
docker compose --env-file .env.example up --build
```

2. Acesse:

- Frontend: `http://localhost:5173`
- Backend (API): `http://localhost:8080`
- Health endpoint: `http://localhost:8080/actuator/health`

## Serviços e portas

O `docker-compose.yml` da raiz sobe os serviços:

- `db`: PostgreSQL
- `backend`: Spring Boot
- `frontend`: Vite dev server

Portas padrão (podem ser alteradas por env var):

- `POSTGRES_PORT=5432`
- `BACKEND_PORT=8080`
- `FRONTEND_PORT=5173`

## Variáveis de ambiente

Para evitar atrito aos avaliadores, as variáveis são carregadas direto de `.env.example` via `--env-file`.

Se quiser customizar valores locais, copie `.env.example` para `.env` e rode o Compose sem `--env-file`.

| Variável               | Obrigatória | Uso                                                          |
| ---------------------- | ----------- | ------------------------------------------------------------ |
| `POSTGRES_IMAGE`       | Sim         | Imagem do PostgreSQL usada no Compose.                       |
| `POSTGRES_PORT`        | Sim         | Porta publicada do PostgreSQL no host.                       |
| `POSTGRES_DB`          | Sim         | Nome do banco utilizado pelo backend.                        |
| `POSTGRES_USER`        | Sim         | Usuário do banco.                                            |
| `POSTGRES_PASSWORD`    | Sim         | Senha do banco.                                              |
| `BACKEND_PORT`         | Sim         | Porta publicada da API.                                      |
| `FRONTEND_PORT`        | Sim         | Porta publicada do frontend.                                 |
| `VITE_API_URL`         | Sim         | Base URL da API consumida pelo frontend.                     |
| `APP_SEED`             | Sim         | Quando `true`, executa seed local se a tabela estiver vazia. |
| `CORS_ALLOWED_ORIGINS` | Sim         | Origens permitidas no backend (CSV).                         |

## Banco e migrações (Flyway)

- Migration inicial: `backend/src/main/resources/db/migration/V1__create_assets_table.sql`.
- O backend sobe com:
  - Flyway habilitado (`spring.flyway.enabled=true`).
  - Hibernate em `ddl-auto: validate` para garantir aderência ao schema versionado.

Ao iniciar a aplicação:

- O Flyway valida/aplica migrations automaticamente.
- Se `APP_SEED=true` e a tabela `assets` estiver vazia, o backend popula 200 registros fictícios.

### Como resetar o banco

Para remover containers e volume do banco:

```bash
docker compose --env-file .env.example down -v
```

Depois, suba novamente:

```bash
docker compose --env-file .env.example up --build
```

## CORS

O backend lê `CORS_ALLOWED_ORIGINS` e aplica as origens permitidas globalmente.

Exemplo padrão:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Validação rápida pós-subida

Verificar status dos serviços:

```bash
docker compose ps
```

Health da API:

```bash
curl -i http://localhost:8080/actuator/health
```

Listagem paginada de assets:

```bash
curl -i "http://localhost:8080/assets?page=0&size=10"
```

Preflight CORS permitido:

```bash
curl -i -X OPTIONS "http://localhost:8080/assets" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET"
```

## Endpoints principais da API

- `GET /assets`
- `POST /assets`
- `PUT /assets/{id}`
- `DELETE /assets/{id}`
- `GET /actuator/health`

## Decisões técnicas principais

### Backend

- Spring Boot 4 + Java 21
- PostgreSQL 18
- Flyway para migrações versionadas
- Validações de payload e tratamento global de erros (`400`, `404`, `409`)
- Seed local configurável por env var (`APP_SEED`)

### Frontend

- React + TypeScript + Vite
- TanStack Query para estado de servidor e invalidação de cache
- TanStack Table para tabela headless com paginação/filtros server-side
- shadcn/ui para componentes visuais

### Infra local

- Monorepo na raiz
- Docker Compose único para `db`, `backend` e `frontend`
- Healthchecks no Compose para subida ordenada e mais estável

## Comandos úteis

Parar containers:

```bash
docker compose --env-file .env.example down
```

Ver logs:

```bash
docker compose --env-file .env.example logs -f
```

Ver logs de um serviço:

```bash
docker compose --env-file .env.example logs -f backend
docker compose --env-file .env.example logs -f frontend
docker compose --env-file .env.example logs -f db
```
