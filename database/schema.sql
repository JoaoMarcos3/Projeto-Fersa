-- =====================================================================
-- FERSA Care — Schema do banco (Supabase / Postgres)
-- Fase 2 do projeto. Dados de exemplo (seed) ficam em seed.sql à parte.
--
-- Como rodar:
--   1) Supabase Dashboard → SQL Editor → cole e execute este arquivo
--      inteiro de uma vez (ou: supabase db execute -f schema.sql via CLI)
--   2) Depois rode seed.sql para popular com as peças fictícias
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensões
-- ---------------------------------------------------------------------
create extension if not exists pgcrypto;  -- gen_random_uuid()
create extension if not exists vector;    -- pgvector: embeddings

-- ---------------------------------------------------------------------
-- Tipos (enums)
-- ---------------------------------------------------------------------
create type perfil_usuario as enum ('MECANICO', 'TECNICO', 'ADMIN', 'CLIENTE');
create type status_chamado as enum ('ABERTO', 'EM_ATENDIMENTO', 'RESOLVIDO');
create type prioridade_chamado as enum ('BAIXA', 'MEDIA', 'ALTA');
create type origem_documento as enum ('CMS', 'SHAREPOINT');
create type status_documento as enum ('RASCUNHO', 'PUBLICADO', 'PROCESSANDO', 'INDEXADO', 'DESATUALIZADO', 'ERRO');
create type tipo_documento as enum ('MANUAL', 'TUTORIAL', 'PROBLEMA', 'PROCEDIMENTO');

-- ---------------------------------------------------------------------
-- Usuários e organizações
-- auth.users já existe (gerenciado pelo Supabase Auth: login, senha,
-- recuperação de senha). `profiles` estende com os dados do domínio.
-- ---------------------------------------------------------------------
create table clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,                 -- ex: "Oficina Trevo Diesel"
  criado_em timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  perfil perfil_usuario not null default 'MECANICO',
  cliente_id uuid references clientes(id),   -- oficina/organização (mecânico e cliente)
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Catálogo: peças, aplicações, ferramentas, lubrificação, mídia
-- ---------------------------------------------------------------------
create table pecas (
  id uuid primary key default gen_random_uuid(),
  part_number text not null unique,
  nome text not null,
  categoria text not null,
  imagem_descricao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_pecas_part_number on pecas (part_number);
create index idx_pecas_categoria on pecas (categoria);

create table aplicacoes (
  id uuid primary key default gen_random_uuid(),
  veiculo text not null,
  modelo text not null,
  unique (veiculo, modelo)
);

create table peca_aplicacoes (
  peca_id uuid references pecas(id) on delete cascade,
  aplicacao_id uuid references aplicacoes(id) on delete cascade,
  primary key (peca_id, aplicacao_id)
);

create table ferramentas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  uso text,
  procedimento text
);

create table peca_ferramentas (
  peca_id uuid references pecas(id) on delete cascade,
  ferramenta_id uuid references ferramentas(id) on delete cascade,
  primary key (peca_id, ferramenta_id)
);

create table lubrificacoes (
  peca_id uuid primary key references pecas(id) on delete cascade,
  tipo text not null,
  intervalo text not null,
  quantidade text not null,
  procedimento text,
  cuidados text[],
  erros_comuns text[]
);

create table tutorial_passos (
  id uuid primary key default gen_random_uuid(),
  peca_id uuid not null references pecas(id) on delete cascade,
  ordem int not null,
  titulo text not null,
  texto text not null,
  imagem_url text,
  unique (peca_id, ordem)
);

create table videos (
  id uuid primary key default gen_random_uuid(),
  peca_id uuid not null references pecas(id) on delete cascade,
  titulo text not null,
  duracao_segundos int,
  tipo text,            -- ex: 'instalacao'
  url text               -- vazio no protótipo; preenchido quando houver mídia real
);

create table imagens (
  id uuid primary key default gen_random_uuid(),
  peca_id uuid not null references pecas(id) on delete cascade,
  descricao text,
  url text
);

create table problemas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  causas text not null,
  verificar text[],
  solucao text not null,
  quando_tecnico text
);

create table peca_problemas (
  peca_id uuid references pecas(id) on delete cascade,
  problema_id uuid references problemas(id) on delete cascade,
  primary key (peca_id, problema_id)
);

-- ---------------------------------------------------------------------
-- Documentos e base de conhecimento (alimenta o RAG)
-- Cobre tanto conteúdo cadastrado no CMS quanto manuais puxados do
-- SharePoint. Os campos sharepoint_* guardam o suficiente para
-- sincronizar sem reprocessar tudo a cada vez.
-- ---------------------------------------------------------------------
create table documentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo tipo_documento not null,
  peca_id uuid references pecas(id),          -- null = documento geral, não ligado a 1 peça
  origem origem_documento not null,
  status status_documento not null default 'RASCUNHO',
  conteudo_bruto text,                         -- texto extraído, antes de dividir em chunks
  versao text,
  hash_conteudo text,                          -- evita reprocessar se nada mudou
  mensagem_erro text,

  -- só preenchido quando origem = SHAREPOINT
  sharepoint_drive_id text,
  sharepoint_item_id text,
  sharepoint_etag text,
  sharepoint_url text,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_documentos_peca on documentos (peca_id);
create index idx_documentos_status on documentos (status);
create unique index idx_documentos_sharepoint_item on documentos (sharepoint_drive_id, sharepoint_item_id)
  where origem = 'SHAREPOINT';

-- Dimensão 1536 = text-embedding-3-small (OpenAI). Se o modelo de
-- embeddings escolhido na PoC for outro, ajuste a dimensão aqui —
-- e reindexe tudo, pois embeddings de modelos diferentes não são
-- comparáveis entre si.
create table documento_chunks (
  id uuid primary key default gen_random_uuid(),
  documento_id uuid not null references documentos(id) on delete cascade,
  ordem int not null,
  cabecalho_contexto text,      -- ex: "FRS-1001 › Problemas comuns › Aquecimento"
  conteudo text not null,
  embedding vector(1536),
  criado_em timestamptz not null default now(),
  unique (documento_id, ordem)
);

-- Índice aproximado para busca por similaridade em escala.
-- HNSW é o recomendado atualmente no pgvector (mais rápido para buscar
-- que IVFFlat, e não exige treinar o índice com dados já carregados).
create index idx_chunks_embedding on documento_chunks
  using hnsw (embedding vector_cosine_ops);

-- ---------------------------------------------------------------------
-- Busca por IA: histórico de perguntas, respostas e fontes citadas
-- ---------------------------------------------------------------------
create table consultas_ia (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references profiles(id),
  pergunta text not null,
  peca_contexto_id uuid references pecas(id),
  encontrou_conteudo boolean not null,
  resposta text not null,
  modelo text,                       -- nome/versão do modelo de IA usado
  feedback_resolveu boolean,         -- null = sem feedback ainda
  criado_em timestamptz not null default now()
);

create table consultas_ia_fontes (
  id uuid primary key default gen_random_uuid(),
  consulta_id uuid not null references consultas_ia(id) on delete cascade,
  chunk_id uuid references documento_chunks(id),
  ordem int not null,
  score numeric
);

-- ---------------------------------------------------------------------
-- Chamados e histórico
-- ---------------------------------------------------------------------
create sequence chamados_numero_seq;

create table chamados (
  id uuid primary key default gen_random_uuid(),
  numero bigint not null default nextval('chamados_numero_seq'),
  protocolo text,   -- preenchido pelo trigger abaixo ("FC-2026-1032")
  status status_chamado not null default 'ABERTO',
  prioridade prioridade_chamado not null default 'MEDIA',
  assunto text not null,
  descricao text not null,
  peca_id uuid references pecas(id),
  aplicacao_texto text,
  solicitante_id uuid not null references profiles(id),
  tecnico_id uuid references profiles(id),
  origem_ia boolean not null default false,
  consulta_ia_id uuid references consultas_ia(id),
  solucao_tecnico text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_chamados_solicitante on chamados (solicitante_id);
create index idx_chamados_status on chamados (status);

-- Gera o protocolo (ex: "FC-2026-1032") na hora do insert. Um trigger,
-- e não uma "generated column", porque to_char()/extract() sobre uma
-- coluna timestamptz não são funções IMMUTABLE — o Postgres exige
-- imutabilidade para generated columns.
create or replace function gerar_protocolo_chamado()
returns trigger
language plpgsql
as $$
begin
  new.protocolo := 'FC-' || to_char(new.criado_em, 'YYYY') || '-' || new.numero;
  return new;
end;
$$;

create trigger trg_protocolo_chamado
  before insert on chamados
  for each row execute function gerar_protocolo_chamado();

create table chamado_historico (
  id uuid primary key default gen_random_uuid(),
  chamado_id uuid not null references chamados(id) on delete cascade,
  autor_id uuid references profiles(id),
  texto text not null,
  criado_em timestamptz not null default now()
);

-- =====================================================================
-- Row Level Security (RLS)
-- O Supabase exige políticas explícitas — sem elas, a tabela fica
-- inacessível para quem usa a chave pública (anon/authenticated).
-- Abaixo: o núcleo. Ajustamos junto com a equipe antes do backend
-- consumir isso — em especial as políticas de ADMIN/TECNICO, que hoje
-- checam profiles.perfil a cada linha (funciona, mas pode ser trocado
-- por JWT custom claims mais adiante para performance).
-- =====================================================================

alter table profiles enable row level security;
alter table pecas enable row level security;
alter table aplicacoes enable row level security;
alter table peca_aplicacoes enable row level security;
alter table ferramentas enable row level security;
alter table peca_ferramentas enable row level security;
alter table lubrificacoes enable row level security;
alter table tutorial_passos enable row level security;
alter table videos enable row level security;
alter table imagens enable row level security;
alter table problemas enable row level security;
alter table peca_problemas enable row level security;
alter table documentos enable row level security;
alter table documento_chunks enable row level security;
alter table consultas_ia enable row level security;
alter table consultas_ia_fontes enable row level security;
alter table chamados enable row level security;
alter table chamado_historico enable row level security;

-- Função auxiliar: perfil do usuário autenticado
create or replace function meu_perfil()
returns perfil_usuario
language sql stable
security definer
set search_path = public
as $$
  select perfil from profiles where id = auth.uid()
$$;

-- Catálogo (peças, aplicações, ferramentas, problemas, lubrificação,
-- tutoriais, vídeos, imagens): qualquer usuário autenticado pode ler.
-- Só ADMIN/TECNICO podem escrever.
create policy "catalogo_leitura" on pecas for select using (auth.role() = 'authenticated');
create policy "catalogo_escrita" on pecas for all using (meu_perfil() in ('ADMIN', 'TECNICO'));
-- (replicar as mesmas duas políticas para aplicacoes, peca_aplicacoes,
--  ferramentas, peca_ferramentas, lubrificacoes, tutorial_passos,
--  videos, imagens, problemas, peca_problemas — omitido aqui por
--  repetição; ver observação no final do arquivo)

-- Documentos: conteúdo publicado é visível a todos autenticados;
-- rascunho só para quem cadastra.
create policy "documentos_leitura_publicado" on documentos for select
  using (status in ('PUBLICADO', 'INDEXADO', 'DESATUALIZADO') or meu_perfil() in ('ADMIN', 'TECNICO'));
create policy "documentos_escrita" on documentos for all using (meu_perfil() in ('ADMIN', 'TECNICO'));
create policy "chunks_leitura" on documento_chunks for select using (auth.role() = 'authenticated');
create policy "chunks_escrita" on documento_chunks for all using (meu_perfil() in ('ADMIN', 'TECNICO'));

-- Perfis: cada um vê o próprio; ADMIN vê todos.
create policy "profiles_proprio" on profiles for select using (id = auth.uid() or meu_perfil() = 'ADMIN');
create policy "profiles_admin_escreve" on profiles for update using (meu_perfil() = 'ADMIN');

-- Consultas de IA: cada usuário vê as próprias; TECNICO/ADMIN veem todas.
create policy "consultas_leitura" on consultas_ia for select
  using (usuario_id = auth.uid() or meu_perfil() in ('ADMIN', 'TECNICO'));
create policy "consultas_insercao" on consultas_ia for insert with check (usuario_id = auth.uid());
create policy "fontes_leitura" on consultas_ia_fontes for select using (auth.role() = 'authenticated');

-- Chamados: mecânico vê e cria os próprios; técnico/admin veem e
-- atendem todos.
create policy "chamados_leitura" on chamados for select
  using (solicitante_id = auth.uid() or meu_perfil() in ('ADMIN', 'TECNICO'));
create policy "chamados_insercao" on chamados for insert with check (solicitante_id = auth.uid());
create policy "chamados_atualizacao" on chamados for update
  using (meu_perfil() in ('ADMIN', 'TECNICO') or solicitante_id = auth.uid());
create policy "historico_leitura" on chamado_historico for select
  using (exists (select 1 from chamados c where c.id = chamado_id and
    (c.solicitante_id = auth.uid() or meu_perfil() in ('ADMIN', 'TECNICO'))));
create policy "historico_insercao" on chamado_historico for insert with check (true);

-- NOTA: as políticas de "catalogo_leitura"/"catalogo_escrita" precisam
-- ser replicadas para as demais tabelas de catálogo listadas no
-- comentário acima antes de habilitar RLS em produção — deixei só o
-- exemplo em `pecas` para revisarmos juntos o padrão antes de repetir
-- em massa.
