# FERSA Care — Backend (Fase 3)

API REST em Java + Spring Boot, falando com o Supabase (Postgres). Este
pacote cobre **Segurança + Catálogo (busca e ficha da peça) + Chamados**.
CMS de escrita e IA/RAG ficam para as próximas fases, como já combinado.

## Por que JdbcTemplate e não JPA/Hibernate?

Decisão desta etapa, registrada aqui porque muda a cara do projeto: em vez
de `@Entity`/Hibernate, os repositórios usam `NamedParameterJdbcTemplate`
com SQL explícito. Dois motivos:

1. **Controle**: o schema tem coisas que o ORM deixa menos óbvias — uma
   chave gerada por trigger (`protocolo`), colunas `text[]` do Postgres,
   enums nativos (`prioridade_chamado`). Em SQL direto, cada uma dessas
   partes fica visível e comentada no código.
2. Cada query deste pacote foi **testada contra um Postgres 16 + pgvector
   real** (o mesmo schema.sql da Fase 2) antes de virar código Java —
   incluindo um detalhe que só aparece em runtime: bind de `String` contra
   coluna `enum` do Postgres falha sem `::prioridade_chamado` explícito.
   Isso é o tipo de erro que o Hibernate esconde atrás de anotação, e que
   eu não conseguiria pegar sem rodar de verdade.

Se a equipe preferir JPA mais pra frente, dá para trocar só a camada de
repositório — Service e Controller não mudam.

## Status da compilação

Confirmado: o projeto compila (`mvn compile` já rodou com sucesso neste
ambiente). Depois dessa confirmação, os pacotes foram reorganizados para
`controller` / `service` / `repository` / `model` (ver "Estrutura" abaixo)
e um bean de CORS foi extraído para `config/CorsConfig.java` — mudança só
de organização de arquivo, nenhuma lógica foi tocada: cada classe movida
foi comparada byte a byte com a versão anterior (revertendo o caminho do
pacote) antes de eu considerar a migração concluída. Ainda assim, rode
`mvn clean compile` de novo depois de puxar esta versão, por garantia.

## Pré-requisitos

- Java 21
- Maven (ou o wrapper `./mvnw`, se vierem a adicionar um)
- Projeto Supabase já criado, com `schema.sql` e `seed.sql` da Fase 2 rodados

## Variáveis de ambiente

Nenhum segredo vai pro repositório — `.env` está no `.gitignore` da raiz
do projeto, só `.env.example` (sem valor real) é commitado.

```bash
cp .env.example .env
```

| Variável | Onde encontrar no Supabase | Exemplo |
|---|---|---|
| `SUPABASE_DB_URL` | Project Settings → Database → Connection string (JDBC) | `jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres` |
| `SUPABASE_DB_USER` | idem | `postgres` |
| `SUPABASE_DB_PASSWORD` | a senha que você definiu ao criar o projeto | — |
| `SUPABASE_JWKS_URL` | é sempre a mesma URL, só troca o `<project-ref>` | `https://<project-ref>.supabase.co/auth/v1/jwks` |
| `SUPABASE_JWT_ISSUER` | idem | `https://<project-ref>.supabase.co/auth/v1` |
| `FERSA_CORS_ORIGINS` | origem do Web em dev | `http://127.0.0.1:5500,http://localhost:5500` |
| `PORT` | opcional — porta da API | `8080` |

## Como rodar

```bash
mvn clean compile   # confirma que compila no seu ambiente
./run.sh            # Linux/macOS — carrega .env e sobe em http://localhost:8080
run.cmd              # Windows — mesma coisa
```

`run.sh`/`run.cmd` só leem o `.env` e chamam `mvn spring-boot:run` — se
preferir, exporte as variáveis você mesmo e rode `mvn spring-boot:run`
direto, dá no mesmo.

Teste rápido (não exige token):

```bash
curl http://localhost:8080/actuator/health
# {"status":"UP"}
```

## Como testar os endpoints autenticados

Pegue um **access token** de um dos usuários de teste (os que você criou
no Supabase Auth na Fase 2) — mais simples é pelo Web: faça login no
protótipo, abra o DevTools → Application → Local Storage, ou chame direto
a API do Supabase:

```bash
curl -X POST "https://xxxxx.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: <sua-anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"email":"mecanico@oficina.com","password":"<a-senha-que-voce-definiu>"}'
# devolve { "access_token": "...", ... }
```

Com o token em mãos:

```bash
TOKEN="cole-aqui-o-access_token"

# quem eu sou
curl http://localhost:8080/api/v1/auth/me -H "Authorization: Bearer $TOKEN"

# busca tradicional — modo: partNumber | aplicacao | veiculo | modelo | categoria | geral
curl "http://localhost:8080/api/v1/pecas?termo=scania&modo=veiculo" -H "Authorization: Bearer $TOKEN"

# ficha completa da peça
curl "http://localhost:8080/api/v1/pecas/<id-da-peca>" -H "Authorization: Bearer $TOKEN"

# abrir chamado (precisa de um usuário MECANICO ou CLIENTE)
curl -X POST http://localhost:8080/api/v1/chamados \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"assunto":"Teste","descricao":"Descrição de teste","prioridade":"ALTA"}'

# listar meus chamados
curl http://localhost:8080/api/v1/chamados -H "Authorization: Bearer $TOKEN"

# técnico assume (precisa de um usuário TECNICO ou ADMIN)
curl -X POST http://localhost:8080/api/v1/chamados/<id>/assumir -H "Authorization: Bearer $TOKEN_TECNICO"

# técnico registra solução
curl -X POST http://localhost:8080/api/v1/chamados/<id>/solucao \
  -H "Authorization: Bearer $TOKEN_TECNICO" -H "Content-Type: application/json" \
  -d '{"solucao":"Pré-carga corrigida conforme torque do manual."}'
```

Esperado: sem token → `401`. Token de mecânico tentando `/assumir` → `403`
(corpo `ApiError` com `"erro": "Acesso negado"`). Mecânico tentando ver o
chamado de outro mecânico pelo id → `404` (de propósito — ver comentário
em `ChamadoService.buscarDetalhe`).

## Endpoints desta entrega

| Método | Rota | Quem acessa |
|---|---|---|
| GET | `/actuator/health` | público |
| GET | `/api/v1/auth/me` | qualquer autenticado |
| GET | `/api/v1/pecas?termo=&modo=` | qualquer autenticado |
| GET | `/api/v1/pecas/{id}` | qualquer autenticado |
| POST | `/api/v1/chamados` | MECANICO, CLIENTE |
| GET | `/api/v1/chamados` | qualquer autenticado (mecânico/cliente vê só os seus; técnico/admin vê todos) |
| GET | `/api/v1/chamados/{id}` | dono do chamado, ou TECNICO/ADMIN |
| POST | `/api/v1/chamados/{id}/assumir` | TECNICO, ADMIN |
| POST | `/api/v1/chamados/{id}/solucao` | TECNICO, ADMIN |

## Estrutura

```
src/main/java/com/fersacare/api/
├── FersaCareApplication.java
├── config/              → CorsConfig (quem pode chamar a API pelo navegador)
├── security/            → SecurityConfig, validação do JWT do Supabase, authorities por perfil
├── common/              → ApiError, exceções, GlobalExceptionHandler
├── usuarios/            → perfil do usuário logado (GET /auth/me)
│   ├── model/             → PerfilUsuario (enum), Profile
│   ├── repository/        → ProfileRepository
│   └── controller/        → AuthController
├── catalogo/            → peças, aplicações, ferramentas, problemas, lubrificação, passos, vídeos
│   ├── dto/                → contratos da API (também fazem o papel de "model" de leitura aqui —
│   │                         não há Entity JPA porque o módulo é só leitura, ver decisão acima)
│   ├── repository/         → SQL (PecaRepository, FerramentaRepository, …)
│   ├── service/            → PecaService (monta a ficha completa)
│   └── controller/         → PecaController
└── chamados/            → abrir, listar, assumir, registrar solução
    ├── model/              → StatusChamado, PrioridadeChamado (enums)
    ├── dto/                → contratos da API
    ├── repository/         → ChamadoRepository, ChamadoHistoricoRepository
    ├── service/            → ChamadoService (regras: quem vê o quê, transições de status)
    └── controller/         → ChamadoController
```

Nomenclatura em linha com o que foi combinado no início do projeto:
Controller / Service / Repository / Model / DTO / Config / Security.

## Próximos passos

1. Rodar `mvn clean compile` depois da reorganização de pacotes, por garantia.
2. CMS de escrita (cadastrar/editar peça, ferramenta, problema) — próxima
   fatia do backend.
3. Módulo de IA/RAG (`/api/v1/ia`, `/api/v1/rag`) — depois do PoC.
4. O Web já está conectado (ver `../web/README.md`) — falta só CMS e IA,
   que continuam no mock até os itens acima.
