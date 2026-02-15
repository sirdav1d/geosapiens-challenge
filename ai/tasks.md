<!-- @format -->

# Tasks

Lista de tarefas derivada do `ai/prd.md`.

Regras:

1. Numeração global e sequencial (não reinicia por seção).
2. Tarefas agrupadas por assunto.
3. Sem duplicidade e sem redundância.

## Infraestrutura e execução local (Docker)

1. [x] Validar a estrutura de monorepo com `backend/` e `frontend/` na raiz e padronizar `.gitignore`/nomenclaturas necessárias para trabalho e avaliação.

Concluído: repo Git na raiz (monorepo), `.gitignore` raiz para `backend/` e `frontend/`, e backups de `.git` antigos em `.git-backup/`.

2. [x] Consolidar Docker Compose: criar `docker-compose.yml` na raiz com serviços `db` (PostgreSQL), `backend` (Spring Boot) e `frontend` (dev server durante desenvolvimento; build estático na entrega), e configurar via variáveis de ambiente (incluindo `VITE_API_URL`, credenciais do banco e flags de seed).

Concluído: criado `docker-compose.yml` na raiz com `db`, `backend` e `frontend` usando env vars (inclui `VITE_API_URL`, credenciais do Postgres e placeholders `APP_SEED`/`CORS_ALLOWED_ORIGINS`) e adicionado `.env.example`. Removido `backend/docker-compose.yml` para evitar fluxo parcial (subir só db). Validação: `docker compose config` ok.
3. [x] Criar `backend/Dockerfile` e `frontend/Dockerfile` para que `docker compose up --build` funcione sem dependências instaladas na máquina (Java/Node fora do Docker).

Concluído: criado `backend/Dockerfile` (build JAR com Maven e runtime em JRE) e `frontend/Dockerfile` (ambiente de dev com `pnpm dev`). Atualizado `docker-compose.yml` para usar `build:` nos serviços `backend` e `frontend` e habilitar volume de `node_modules` no frontend para HMR. Adicionados `.dockerignore`. (Opcional: `frontend/Dockerfile.prod` + `frontend/nginx.conf` para servir build estático mais perto da entrega.)
4. [x] Adicionar healthchecks e dependências de inicialização no Compose (db pronto antes do backend; backend pronto antes do frontend) para garantir subida estável.

Concluído: adicionado healthcheck no `db` via `pg_isready` e no `backend` via `GET /actuator/health`, e atualizado `depends_on` para aguardar `service_healthy` (db -> backend -> frontend).

## Banco de dados e migrações (Flyway/PostgreSQL)

5. [x] Implementar migração Flyway `V1__create_assets_table.sql` criando a tabela `assets` com constraints (incluindo `serialNumber` único), timestamps e índices para paginação/filtros/busca.

Concluído: criada a migration `backend/src/main/resources/db/migration/V1__create_assets_table.sql` com tabela `assets`, `serial_number` único, checks para `category/status`, check para `acquisition_date` não futura, e índices para `category/status/acquisition_date/name`. Categorias: `COMPUTER`, `PERIPHERAL`, `NETWORK_EQUIPMENT`, `SERVER_INFRA`, `MOBILE_DEVICE`.
6. [x] Ajustar configurações do backend: unificar `application.yml`/`application.properties` para evitar divergências e ler conexão do banco via variáveis de ambiente (host/porta/db/usuário/senha), mantendo `ddl-auto: validate` para garantir aderência ao schema versionado.

Concluído: removido `backend/src/main/resources/application.properties` e padronizado `backend/src/main/resources/application.yml` com placeholders (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`). `docker-compose.yml` atualizado para passar essas variáveis para o backend.

## Backend (API REST de Assets)

7. [x] Implementar o modelo `Asset` (JPA) com `Category` e `Status` (enums) e campos `createdAt/updatedAt` conforme o PRD.

Concluído: criado `Asset` (JPA) + enums `Category`/`Status` em `backend/src/main/java/com/geosapiens/backend/assets/`, com mapeamento para a tabela `assets` e timestamps `createdAt/updatedAt` via `@PrePersist/@PreUpdate`.
8. [x] Implementar DTOs de entrada/saída e validações de servidor: obrigatórios, data de aquisição não futura e valores permitidos para enums.

Concluído: adicionados DTOs `AssetUpsertRequest` (validações com `@NotBlank`, `@NotNull`, `@Size`, `@PastOrPresent`) e `AssetResponse` em `backend/src/main/java/com/geosapiens/backend/assets/dto/`. Observação: `category`/`status` tipados como enums garantem valores permitidos na desserialização (inválidos retornam 400; payload consistente será tratado na Task 12).
9. [ ] Implementar camada de repositório/serviço com CRUD e regra de unicidade de `serialNumber` (retornando 409 em conflito).
10. [ ] Implementar `GET /assets` aceitando `page` (padrão 0), `size` (padrão 20, máximo 100), `sort` opcional, `category`/`status` opcionais e `q` opcional (busca em `name` e `serialNumber`), aplicando filtros/busca antes da paginação e retornando `{ items, page, size, totalElements, totalPages }`.
11. [ ] Implementar `POST /assets` (201), `PUT /assets/{id}` (200) e `DELETE /assets/{id}` (204) conforme contrato do PRD.
12. [ ] Implementar tratamento global de erros (400/404/409) com payload consistente para validação, id inexistente e conflito (serial duplicado).
13. [ ] Configurar CORS por ambiente (origens permitidas via env var) e garantir integração com o frontend local.
14. [ ] Implementar seed local: ao iniciar, se não existir nenhum ativo, popular automaticamente com 200 itens fictícios cobrindo `Category` (COMPUTER, PERIPHERAL, NETWORK_EQUIPMENT, SERVER_INFRA, MOBILE_DEVICE) e `Status` (IN_USE, IN_STOCK, MAINTENANCE, RETIRED), com datas de aquisição em faixa realista (ex.: últimos 5 anos) e `serialNumber` único, executando apenas em ambiente local (profile/env).
15. [ ] Garantir observabilidade básica: Actuator com health check habilitado e logs legíveis, e expor o health endpoint para uso no Compose.

## Frontend (React SPA)

16. [ ] Definir tipos TypeScript e cliente HTTP para a API, usando `VITE_API_URL` como base e suportando o payload paginado (`items`, `page`, `size`, `totalElements`, `totalPages`).
17. [ ] Implementar tela de listagem com tabela e colunas principais, incluindo ações por linha (Editar/Excluir).
18. [ ] Implementar filtros por Categoria e Status + busca textual opcional (nome e número de série), integrados ao backend.
19. [ ] Implementar paginação (próxima/anterior e seleção simples), exibindo página atual, total de páginas e total de itens, preservando filtros/busca ao trocar de página.
20. [ ] Implementar estados de UI: loading, empty state e erro, incluindo tratamento específico de erros HTTP (400, 404, 409).

## Frontend (Fluxos de CRUD)

21. [ ] Implementar formulário de criação (nome, número de série, categoria, status, data de aquisição) com validação no cliente (obrigatórios e data não futura) e integração com `POST /assets`.
22. [ ] Implementar formulário de edição com validação no cliente e integração com `PUT /assets/{id}`.
23. [ ] Implementar exclusão com confirmação e atualização da listagem após `DELETE /assets/{id}`.

## Integração, documentação e validação

24. [ ] Validar integração full stack no Docker: frontend consumindo backend (env/proxy), backend consumindo o Postgres do Compose, e resolver CORS quando aplicável.
25. [ ] Atualizar `README.md` (raiz) com passo a passo plug and play (`docker compose up --build`), portas/URLs, variáveis de ambiente, como resetar o banco (opcional), como rodar/validar migrations e decisões técnicas principais (e remover/ajustar referências de templates quando aplicável).
26. [ ] Criar checklist de testes manuais (curl/Insomnia + UI) cobrindo CRUD, paginação, filtros, busca e validações.
27. [ ] Implementar testes básicos no backend (validação de DTOs e casos de erro 404/409) e garantir execução local.
28. [ ] Executar smoke test final e checar critérios de aceitação do PRD: subir stack do zero, seed com 200 ativos, e fluxos completos na UI (listar/filtrar/buscar/paginar/criar/editar/excluir).
