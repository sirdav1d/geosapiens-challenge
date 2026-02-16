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

9. [x] Implementar camada de repositório/serviço com CRUD e regra de unicidade de `serialNumber` (retornando 409 em conflito).

Concluído: criado `AssetRepository` + `AssetService` com operações de `create/update/getById/delete` e regra de unicidade do `serialNumber` (lança 409 em conflito) + exceção 404 para id inexistente. Arquivos: `backend/src/main/java/com/geosapiens/backend/assets/AssetRepository.java`, `backend/src/main/java/com/geosapiens/backend/assets/AssetService.java`, `backend/src/main/java/com/geosapiens/backend/assets/exceptions/AssetNotFoundException.java`, `backend/src/main/java/com/geosapiens/backend/assets/exceptions/SerialNumberConflictException.java`. Validação: `backend/mvnw.cmd -DskipTests package` ok.

10. [x] Implementar `GET /assets` aceitando `page` (padrão 0), `size` (padrão 20, máximo 100), `sort` opcional, `category`/`status` opcionais e `q` opcional (busca em `name` e `serialNumber`), aplicando filtros/busca antes da paginação e retornando `{ items, page, size, totalElements, totalPages }`.

Concluído: implementado `GET /assets` em `backend/src/main/java/com/geosapiens/backend/assets/AssetController.java` com paginação (`page`/`size`, max 100), `sort` (whitelist de campos) e filtros `category`/`status` + busca `q` (case-insensitive em `name` e `serialNumber`) via `Specification` no `AssetService`. Payload: `{ items, page, size, totalElements, totalPages }` com `AssetsPageResponse`. Arquivos: `backend/src/main/java/com/geosapiens/backend/assets/AssetController.java`, `backend/src/main/java/com/geosapiens/backend/assets/AssetSpecifications.java`, `backend/src/main/java/com/geosapiens/backend/assets/AssetRepository.java`, `backend/src/main/java/com/geosapiens/backend/assets/AssetService.java`, `backend/src/main/java/com/geosapiens/backend/assets/dto/AssetsPageResponse.java`. Validação: `backend/mvnw.cmd -DskipTests package` ok.

11. [x] Implementar `POST /assets` (201), `PUT /assets/{id}` (200) e `DELETE /assets/{id}` (204) conforme contrato do PRD.

Concluído: adicionados endpoints CRUD no `AssetController`: `POST /assets` (201), `PUT /assets/{id}` (200) e `DELETE /assets/{id}` (204), usando `@Valid` para validar `AssetUpsertRequest` e retornando `AssetResponse`. Validação: `backend/mvnw.cmd -DskipTests package` ok.

12. [x] Implementar tratamento global de erros (400/404/409) com payload consistente para validação, id inexistente e conflito (serial duplicado).

Concluído: criada estrutura de tratamento global em `backend/src/main/java/com/geosapiens/backend/assets/exceptions/GlobalExceptionHandler.java` com `@RestControllerAdvice`, padronizando payload via `ApiErrorResponse` (`backend/src/main/java/com/geosapiens/backend/assets/dto/ApiErrorResponse.java`) para `400` (validação, bind e requisição inválida), `404` (`AssetNotFoundException`) e `409` (`SerialNumberConflictException`). Validação: `backend/mvnw.cmd -DskipTests package` ok.

13. [x] Configurar CORS por ambiente (origens permitidas via env var) e garantir integração com o frontend local.

Concluído: configurado CORS global no backend via `backend/src/main/java/com/geosapiens/backend/config/CorsConfig.java`, lendo `CORS_ALLOWED_ORIGINS` (lista separada por vírgula) e aplicando em `/**` para permitir o frontend local (`http://localhost:5173`). Validação: `backend/mvnw.cmd -DskipTests package` ok.

14. [x] Implementar seed local: ao iniciar, se não existir nenhum ativo, popular automaticamente com 200 itens fictícios cobrindo `Category` (COMPUTER, PERIPHERAL, NETWORK_EQUIPMENT, SERVER_INFRA, MOBILE_DEVICE) e `Status` (IN_USE, IN_STOCK, MAINTENANCE, RETIRED), com datas de aquisição em faixa realista (ex.: últimos 5 anos) e `serialNumber` único, executando apenas em ambiente local (profile/env).

Concluído: criado seeder no backend em `backend/src/main/java/com/geosapiens/backend/assets/seed/AssetSeedRunner.java`, controlado por `APP_SEED=true` e executando apenas quando a tabela estiver vazia (`assetRepository.count() == 0`). Gera 200 assets cobrindo todas as combinações de `Category`/`Status`, com `serialNumber` único e `acquisitionDate` nos últimos 5 anos. Variáveis documentadas em `.env.example`. Validação: `backend/mvnw.cmd -DskipTests package` ok.

15. [x] Garantir observabilidade básica: Actuator com health check habilitado e logs legíveis, e expor o health endpoint para uso no Compose.

Concluído: Actuator habilitado no backend via dependência `spring-boot-starter-actuator` (em `backend/pom.xml`) e endpoint de health exposto em `GET /actuator/health` (configurado em `backend/src/main/resources/application.yml`). `docker-compose.yml` usa `GET /actuator/health` como healthcheck do serviço `backend` (curl instalado no runtime em `backend/Dockerfile`). Logs do backend configurados com pattern legível em `backend/src/main/resources/application.yml`. Validação: `backend/mvnw.cmd -DskipTests package` ok.

## Frontend (React SPA)

16. [x] Definir tipos TypeScript e camada de dados com TanStack Query para a API, usando `VITE_API_URL` como base e suportando o payload paginado (`items`, `page`, `size`, `totalElements`, `totalPages`).

Concluído: camada de API tipada no frontend com contratos de domínio/paginação/erros em `frontend/src/api/types.ts`, migração para TanStack Query com hooks de listagem e mutações CRUD + invalidação de cache em `frontend/src/api/assets.ts`, provider global `QueryClientProvider` em `frontend/src/main.tsx`, tipagem explícita de env em `frontend/src/vite-env.d.ts` e remoção do cliente legado (`frontend/src/api/client.ts`). Validação: `pnpm --dir frontend build` ok.

17. [x] Implementar tela de listagem com TanStack Table (headless), colunas principais e ações por linha (Editar/Excluir).

Concluído: implementada listagem em tabela headless com TanStack Table em `frontend/src/components/assets-list-table.tsx`, incluindo colunas principais (`name`, `serialNumber`, `category`, `status`, `acquisitionDate`) e ações por linha (`Editar`/`Excluir`). Adicionados componentes base no padrão shadcn/ui para reutilização (`frontend/src/components/ui/table.tsx` e `frontend/src/components/ui/button.tsx`) e integrada a listagem no `frontend/src/App.tsx` consumindo dados da API já via TanStack Query. Validação: `pnpm --dir frontend lint` e `pnpm --dir frontend build` ok.

18. [x] Implementar filtros por Categoria e Status + busca textual opcional (nome e número de série), sincronizados entre o estado da TanStack Table e os parâmetros da API.

Concluído: adicionados filtros de `category` e `status` com `Select` (shadcn/ui) e busca textual `q` com `Input` (shadcn/ui) na tabela de ativos, com estado controlado da TanStack Table sincronizado aos parâmetros da API no `useAssetsQuery`. Também foi implementado reset de página para `0` ao alterar filtros/busca, mantendo o fluxo de paginação coerente com o backend. Arquivos: `frontend/src/App.tsx`, `frontend/src/components/assets-list-table.tsx`, `frontend/src/components/ui/input.tsx`, `frontend/src/components/ui/select.tsx`. Validação: `pnpm --dir frontend lint` e `pnpm --dir frontend build` ok.

19. [x] Implementar paginação (próxima/anterior e seleção simples), exibindo página atual, total de páginas e total de itens, com estado controlado da TanStack Table e preservação de filtros/busca ao trocar de página.

Concluído: paginação migrada para estado controlado da TanStack Table (`pagination` com `pageIndex/pageSize`) em modo manual/server-side (`manualPagination`) com `rowCount/pageCount` vindos da API. Os controles usam API da tabela (`previousPage`, `nextPage`, `setPageIndex`) e exibem metadados (`Página X de Y · N itens`). Filtros e busca foram preservados na troca de página, com reset para página 0 ao alterar critérios. Arquivos: `frontend/src/App.tsx`, `frontend/src/components/assets-list-table.tsx`. Validação: `pnpm --dir frontend lint` e `pnpm --dir frontend build` ok.

20. [x] Implementar estados de UI: loading, empty state e erro, incluindo tratamento específico de erros HTTP (400, 404, 409).

Concluído: implementados estados de UI na listagem de ativos com `loading` (skeleton da tabela e filtros), `empty state` contextual (sem dados e sem/com filtros aplicados, com ação de limpar filtros) e `erro` com mensagens amigáveis por status HTTP (`400`, `404`, `409`) e fallback para erro inesperado, além de ação de retry. Também foi adicionado feedback de atualização durante refetch. Arquivos: `frontend/src/components/assets-list-section.tsx`, `frontend/src/components/assets-table/data-table.tsx`, `frontend/src/components/ui/alert.tsx`. Validação: `pnpm --dir frontend lint` e `pnpm --dir frontend build` ok.

20.a [x] Adicionar debounce na busca textual (`q`) para reduzir volume de requisições durante digitação.

Concluído: implementado debounce de 400ms na busca textual da listagem antes de enviar `q` para a API, evitando requisições a cada tecla. Mantida UX imediata para estado de filtros, com limpeza de busca sem atraso no parâmetro enviado. Arquivos: `frontend/src/hooks/use-debounced-value.ts`, `frontend/src/components/assets-list-section.tsx`. Validação: `pnpm --dir frontend lint` e `pnpm --dir frontend build` ok.

20.b [x] Sincronizar paginação, filtros e busca na URL para permitir compartilhamento/restore de estado.

Concluído: sincronizado estado de listagem com query string da URL (`page`, `size`, `q`, `category`, `status`) com restauração ao carregar a página e atualização automática via `history.replaceState` quando paginação, busca ou filtros mudam. Incluída validação de parâmetros inválidos na leitura da URL para manter fallback seguro aos valores padrão. Arquivo: `frontend/src/components/assets-list-section.tsx`. Validação: `pnpm --dir frontend lint` e `pnpm --dir frontend build` ok.

20.c [x] Implementar prefetch da próxima página com TanStack Query para melhorar percepção de desempenho na navegação.

Concluído: adicionado prefetch da próxima página da listagem com TanStack Query após o carregamento da página atual, preservando os mesmos filtros/busca (`q`, `category`, `status`) e `pageSize`. O prefetch só executa quando existe próxima página (`pageIndex + 1 < totalPages`) e utiliza `assetsQueryKeys` + `fetchAssets` para manter coerência de cache. Arquivo: `frontend/src/components/assets-list-section.tsx`. Validação: `pnpm --dir frontend lint` e `pnpm --dir frontend build` ok.

20.d [x] Adicionar seletor de tamanho de página (`pageSize`, ex.: 10/20/50) integrado ao estado manual da tabela e à API.

Concluído: adicionado seletor de `itens por página` (10/20/50) na tabela, integrado ao estado de paginação manual da TanStack Table e, consequentemente, aos parâmetros da API. Ao alterar o `pageSize`, a listagem volta para a primeira página (`pageIndex = 0`) para evitar estado inválido de navegação. Arquivo: `frontend/src/components/assets-table/data-table.tsx`. Validação: `pnpm --dir frontend lint` e `pnpm --dir frontend build` ok.

## Frontend (Fluxos de CRUD)

21. [x] Implementar formulário de criação (nome, número de série, categoria, status, data de aquisição) com validação no cliente (obrigatórios e data não futura) e integração com `POST /assets`.

Concluído: implementado formulário de criação em `Sheet` com `react-hook-form` + `zod` e validações de cliente para campos obrigatórios e data de aquisição não futura, com integração ao `POST /assets` via `useCreateAssetMutation`. Também foi adicionado tratamento de erros `400` (mapeamento de erros de campo) e `409` (conflito de número de série), estado de loading no submit e reset controlado ao fechar o formulário. Arquivos: `frontend/src/components/asset-create-sheet.tsx`, `frontend/src/components/assets-list-section.tsx`, `frontend/package.json`, `frontend/pnpm-lock.yaml`. Validação: `pnpm --dir frontend lint` e `pnpm --dir frontend build` ok.

22. [ ] Implementar formulário de edição com validação no cliente e integração com `PUT /assets/{id}`.
23. [ ] Implementar exclusão com confirmação e atualização da listagem após `DELETE /assets/{id}`.

## Integração, documentação e validação

24. [ ] Validar integração full stack no Docker: frontend consumindo backend (env/proxy), backend consumindo o Postgres do Compose, e resolver CORS quando aplicável.
25. [ ] Atualizar `README.md` (raiz) com passo a passo plug and play (`docker compose up --build`), portas/URLs, variáveis de ambiente, como resetar o banco (opcional), como rodar/validar migrations e decisões técnicas principais (e remover/ajustar referências de templates quando aplicável).
26. [ ] Criar checklist de testes manuais (curl/Insomnia + UI) cobrindo CRUD, paginação, filtros, busca e validações.
27. [ ] Implementar testes básicos no backend (validação de DTOs e casos de erro 404/409) e garantir execução local.
28. [ ] Executar smoke test final e checar critérios de aceitação do PRD: subir stack do zero, seed com 200 ativos, e fluxos completos na UI (listar/filtrar/buscar/paginar/criar/editar/excluir).


