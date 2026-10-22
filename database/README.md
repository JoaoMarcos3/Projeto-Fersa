# FERSA Care — Banco de dados

Supabase (Postgres 15+) com a extensão `pgvector` (reservada para o
módulo de RAG, ainda não implementado).

## Como aplicar

No SQL Editor do seu projeto Supabase, nesta ordem:

1. `schema.sql` — tabelas, tipos, índices, trigger de protocolo do
   chamado e as políticas de RLS (Row Level Security).
2. `seed.sql` — as 5 peças fictícias do protótipo (FRS-1001 a FRS-1005),
   com aplicações, ferramentas, problemas, lubrificação, passos e vídeos.

O final do `seed.sql` tem um bloco comentado para ligar os usuários de
teste (mecânico/técnico/admin) depois de criá-los em
**Authentication → Add user** no painel do Supabase.

## Validado contra um Postgres real

Todo o schema e o seed foram rodados e testados num Postgres 16 +
pgvector local antes de qualquer linha virar código do backend — joins,
o trigger que gera o protocolo (`FC-2026-123`), as políticas de RLS e uma
busca por similaridade vetorial usando o índice HNSW. Detalhes de cada
tabela estão comentados dentro do próprio `schema.sql`.
