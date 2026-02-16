<!-- @format -->

# Workflow de trabalho

## Regras gerais

- Escrever sempre em pt-BR com acentos e salvar arquivos em UTF-8.
- Antes de planejar uma task, consultar o MCP Context7 quando houver bibliotecas/frameworks envolvidos (ex.: Vercel AI SDK, Clerk, Supabase, Stripe, PostHog, Sentry).
- Ao criar componentes de UI, priorizar o uso de componentes prontos do shadcn/ui, use o mcp do shadcn ui se disponivel.

## Fluxo por task

1. Identificar a task atual em `tasks.md` (um item numerado).
2. Comparar a task com o `prd.md` e verificar se há inconsistências de escopo (faltando algo do PRD, sobrando algo fora do PRD, ou ambiguidade).
3. Se houver inconsistência, parar e pedir orientação, descrevendo a divergência e o impacto no MVP.
4. Se estiver tudo ok, consultar o MCP Context7 (quando aplicável), criar um plano de execução (passos curtos, em ordem), justificar escolhas técnicas e solicitar aprovação.
5. Após aprovação do plano, executar o plano.
6. Validar manualmente com mcp chrome-devtools ou Playwright sempre que possível para verificar erros de implementação.
7. Ao concluir, atualizar `tasks.md`:
   - indicar que a task foi concluída;
   - colar um resumo do que foi feito logo abaixo da task (incluindo arquivos/rotas afetados e validações manuais);
   - deixar uma linha em branco entre uma revisão de task e a próxima.

## Restrições

1. - Não implemente código sem o plano autorizado
2. - Não implemente integrações com lib externa sem consultar context7 mcp
3. - Não implemente componentes do 0 se for possível reutilizar componentes do shadcn ui e utilize o mcp shadcn para isso
