<!-- @format -->

# PRD: Sistema de Gerenciamento de Ativos (Assets)

## 0) Estado atual do repositório (baseline)
O repositório já contém uma base inicial, mas ainda não atende todos os requisitos abaixo.

* Estrutura de monorepo com `backend/` e `frontend/` na raiz.
* `backend/` em Spring Boot (Java 21) com configurações iniciais de PostgreSQL e Actuator.
* `frontend/` inicializado com Vite + React + TypeScript (template), ainda sem implementação do domínio de Assets.

## 1) Contexto e problema
Empresas precisam controlar ativos como computadores, monitores e periféricos. Sem um sistema simples, isso vira planilha e caos: difícil saber o que existe, onde está, em que status está, e manter cadastro atualizado.

## 2) Objetivos
1. Permitir gerenciamento de ativos via uma SPA em React.
2. Fornecer uma API REST com CRUD de ativos.
3. Rodar localmente de forma plug and play usando Docker Compose, sem depender de instalações fora do Docker para avaliação.
4. Popular automaticamente o banco com 200 itens fictícios para facilitar testes.
5. Suportar paginação no backend e consumo dessa paginação no frontend.
6. Ter documentação clara em README com decisões técnicas e passo a passo.

## 3) Escopo

### 3.1 Dentro do escopo
**Frontend (React)**
* Listagem em tabela.
* Filtros por categoria e status.
* Busca textual opcional em nome e número de série.
* Paginação consumindo o backend.
* Formulário de criação e edição com validação.
* Exclusão com confirmação.
* Estados de UI: loading, empty state e erro.

**Backend (Spring Boot)**
* API REST com endpoints CRUD.
* Persistência em PostgreSQL.
* Validações de entrada no servidor.
* Migrações de banco versionadas (Flyway).
* Paginação, filtro e busca no endpoint de listagem.
* Seed automático com 200 ativos no ambiente local quando o banco estiver vazio.

**Execução local**
* `docker compose up --build` (executado na raiz do monorepo) sobe banco, backend e frontend.
* README descreve execução e testes.

### 3.2 Fora do escopo
* Autenticação e autorização.
* Multi tenant.
* Auditoria detalhada de alterações.
* Upload de imagens e anexos.
* Integrações externas.
* Regras avançadas de permissão e papéis.

## 4) Usuários e casos de uso

### 4.1 Persona
Usuário interno que precisa manter inventário de ativos atualizado.

### 4.2 User stories
1. Como usuário, quero ver uma lista paginada de ativos para ter visão do inventário.
2. Como usuário, quero filtrar por categoria e status para encontrar itens relevantes.
3. Como usuário, quero buscar por texto para localizar um ativo pelo nome ou serial.
4. Como usuário, quero cadastrar um novo ativo com validação para evitar dados ruins.
5. Como usuário, quero editar um ativo para manter informações atualizadas.
6. Como usuário, quero excluir um ativo cadastrado errado ou descontinuado.

## 5) Requisitos funcionais

### 5.1 Frontend
**Listagem**
* Exibir tabela com colunas principais.
* Filtros:
  * Categoria
  * Status
* Busca textual opcional: nome e número de série.
* Paginação:
  * Controles de próxima/anterior e seleção de página (simples).
  * Mostrar página atual, total de páginas e total de itens.
  * Preservar filtros e busca ao trocar de página.
* Ações por linha:
  * Editar
  * Excluir

**Formulário (criar e editar)**
* Campos:
  * Nome
  * Número de série
  * Categoria
  * Status
  * Data de aquisição
* Validações no cliente:
  * Nome obrigatório
  * Número de série obrigatório
  * Categoria obrigatória
  * Status obrigatório
  * Data de aquisição obrigatória e não pode ser futura

**Integração**
* Consumir a API do backend com base em uma env var:
  * `VITE_API_URL`
* Tratar:
  * Loading
  * Erros HTTP (400, 404, 409)
  * Estado vazio

### 5.2 Backend
**Endpoints CRUD**
* GET `/assets`
* POST `/assets`
* PUT `/assets/{id}`
* DELETE `/assets/{id}`

**Filtros, busca e paginação**
* GET `/assets` deve aceitar:
  * `page` (padrão 0)
  * `size` (padrão 20, máximo 100)
  * `sort` opcional (exemplo: `name,asc` ou `acquisitionDate,desc`)
  * `category` opcional
  * `status` opcional
  * `q` opcional (busca em `name` e `serialNumber`)
* Filtros e busca são aplicados antes da paginação.

**Validações no servidor**
* Nome obrigatório.
* Número de série obrigatório e único.
* Data de aquisição obrigatória e não futura.
* Categoria e status aceitam apenas valores permitidos (enum).
* Retornos:
  * 400 para payload inválido
  * 404 para id inexistente
  * 409 para conflito (exemplo: serial duplicado)

**Banco e migrações**
* Schema versionado com Flyway.
* Hibernate configurado para validar o schema (sem criar tabela automaticamente).

### 5.3 Seed de dados (200 itens)
**Requisito**
* Ao subir localmente, se não existir nenhum ativo cadastrado, popular automaticamente com 200 ativos fictícios.
* Os 200 itens devem cobrir:
  * Categorias: COMPUTER, MONITOR, PERIPHERAL
  * Status: IN_USE, IN_STOCK, MAINTENANCE, RETIRED
  * Datas de aquisição em faixa realista (exemplo: últimos 5 anos)
  * Número de série único por item

**Forma de execução**
* Deve rodar apenas no ambiente local (exemplo: profile `local` ou env var `APP_SEED=true` no compose).

### 5.4 Execução local com Docker Compose
* Um comando para subir tudo:
  * `docker compose up --build`
  * O comando deve ser executado na raiz do monorepo (onde ficará o `docker-compose.yml` principal).
  * Não deve exigir Java/Node instalados fora do Docker (apenas Docker/Compose).
* Serviços:
  * `db` (PostgreSQL)
  * `backend` (Spring Boot)
  * `frontend` (build estático servido, exemplo: nginx)
* README deve explicar:
  * portas
  * URLs locais
  * como resetar o banco (opcional)
  * como rodar migrations

## 6) Requisitos não funcionais
* Usabilidade: UI simples e clara, foco em listagem, filtros e formulário.
* Performance: listagem paginada deve responder rápido com dataset de 200 itens.
* Confiabilidade: migrações versionadas e reprodutíveis.
* Segurança mínima:
  * CORS configurável por ambiente
  * secrets fora do código (variáveis no compose)
* Observabilidade básica:
  * logs legíveis no backend
  * health check via Actuator

## 7) Modelo de dados

### 7.1 Entidade Asset
* `id` (long) gerado automaticamente
* `name` (string) obrigatório
* `serialNumber` (string) obrigatório, único
* `category` (enum) obrigatório
  * COMPUTER
  * MONITOR
  * PERIPHERAL
* `status` (enum) obrigatório
  * IN_USE
  * IN_STOCK
  * MAINTENANCE
  * RETIRED
* `acquisitionDate` (date) obrigatório
* `createdAt` (timestamp) gerado
* `updatedAt` (timestamp) gerado

## 8) Contrato da API

### 8.1 GET /assets
**Query params**
* `page` (int) opcional, padrão 0
* `size` (int) opcional, padrão 20, máximo 100
* `sort` (string) opcional, exemplo `name,asc`
* `category` (string) opcional
* `status` (string) opcional
* `q` (string) opcional, busca em `name` e `serialNumber`

**Resposta 200 (formato paginado)**
Sugestão de payload simplificado:

```json
{
  "items": [
    {
      "id": 1,
      "name": "Notebook Dell Latitude",
      "serialNumber": "SN-000001",
      "category": "COMPUTER",
      "status": "IN_USE",
      "acquisitionDate": "2024-02-10",
      "createdAt": "2026-02-14T02:40:00Z",
      "updatedAt": "2026-02-14T02:40:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 200,
  "totalPages": 10
}
```

### 8.2 POST /assets
**Request body**
```json
{
  "name": "Monitor LG 27",
  "serialNumber": "SN-009999",
  "category": "MONITOR",
  "status": "IN_STOCK",
  "acquisitionDate": "2023-10-01"
}
```

**Respostas**
* 201 com o asset criado
* 400 se inválido
* 409 se serialNumber duplicado

### 8.3 PUT /assets/{id}
**Request body**
Mesmo formato do POST.

**Respostas**
* 200 com o asset atualizado
* 400 se inválido
* 404 se não existir
* 409 se serialNumber duplicado em outro registro

### 8.4 DELETE /assets/{id}
**Respostas**
* 204 sem conteúdo
* 404 se não existir

## 9) Fluxos de UX
1. Listar e filtrar
   * usuário abre dashboard
   * aplica filtros e busca
   * navega por páginas

2. Criar
   * clicar em novo ativo
   * preencher formulário
   * salvar
   * voltar para listagem

3. Editar
   * clicar em editar
   * alterar campos
   * salvar

4. Excluir
   * clicar em excluir
   * confirmar
   * item removido e listagem atualiza

## 10) Arquitetura e ambientes

### 10.1 Local (avaliação)
* Tudo sobe via Docker Compose.
* Frontend consome backend local.
* Backend consome Postgres local.

### 10.2 Produção (plus, opcional)
* Frontend pode ser hospedado na Vercel.
* Backend pode ser hospedado em VPS ou plataforma de containers.
* Banco pode ser gerenciado ou em VPS.
* Este deploy é opcional, não critério principal.

## 11) Plano de entrega

### Marco 1: Infra e skeleton
1. Monorepo com `frontend/` e `backend/`.
2. Docker Compose full stack com um comando.
3. README inicial.

### Marco 2: Banco e migrações
1. Flyway V1 criando tabela assets.
2. Configuração JPA com validação do schema.

### Marco 3: Seed e paginação
1. Seed automático com 200 registros quando o banco estiver vazio.
2. GET `/assets` paginado com filtros e busca.

### Marco 4: CRUD completo
1. POST, PUT, DELETE com validação e erros.
2. Testes manuais via curl/Insomnia.

### Marco 5: Frontend funcional
1. Listagem paginada com filtros e busca.
2. Formulário criar/editar.
3. Exclusão.

### Marco 6: Polimento
1. Mensagens de erro amigáveis.
2. Ajustes de UI.
3. Teste final plug and play em máquina limpa.

## 12) Testes e validação
**Backend**
* Testes unitários de validação de DTO.
* Testes básicos de service (opcional).
* Teste manual dos endpoints.

**Frontend**
* Fluxo create edit delete.
* Paginação e filtros.
* Tratamento de erro.

**Integração**
* Subir stack local e validar fluxo completo.

## 13) Riscos e mitigação
1. Docker não subir em máquina do avaliador
   * Mitigação: testar em ambiente limpo e manter README direto.

2. Conflito de portas
   * Mitigação: documentar portas e permitir ajuste simples.

3. Divergência entre schema e entity
   * Mitigação: Flyway + `ddl-auto: validate`.

4. Seed duplicar dados
   * Mitigação: seed roda apenas quando tabela estiver vazia.

## 14) Critérios de aceitação
1. Com `docker compose up --build`, o stack inicia sem ajustes manuais.
2. Banco é populado automaticamente com 200 ativos quando estiver vazio.
3. GET `/assets` retorna paginação com metadados e respeita filtros e busca.
4. Usuário consegue criar, editar e excluir ativos pela UI.
5. Validações existem no frontend e no backend.
6. API retorna códigos HTTP corretos (400, 404, 409) quando aplicável.
7. README explica execução local e decisões técnicas.
