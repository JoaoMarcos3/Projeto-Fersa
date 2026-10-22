# FERSA Care — Web

HTML + CSS + JavaScript puro, sem build step. Fala com o backend (pasta
`../backend`) e com o Supabase Auth direto do navegador para login.

## Configurar

```bash
cp js/config.example.js js/config.js
```

Edite `js/config.js`:

```js
const FERSA_CONFIG = {
  apiUrl: "http://localhost:8080",        // onde o backend Spring está rodando
  supabaseUrl: "https://SEU-PROJETO.supabase.co",
  supabaseAnonKey: "a chave anon/public do projeto" // NUNCA a service_role
};
```

`js/config.js` é ignorado pelo Git (ver `.gitignore` na raiz) — cada
desenvolvedor mantém o seu local, apontando para o próprio ambiente.

> A chave `anon` do Supabase é feita para ficar exposta no navegador (é
> assim que o Supabase funciona); quem protege os dados é o RLS do banco,
> não o sigilo dessa chave. Mesmo assim ela fica de fora do Git, porque
> cada ambiente (dev de cada um, homologação, produção) tem a sua.

## Rodar

Qualquer servidor estático funciona — este projeto não tem build step.

```bash
npm run dev        # sobe em http://localhost:5500
```

Ou, sem instalar nada, a extensão **Live Server** do VS Code, ou:

```bash
python3 -m http.server 5500
```

Em qualquer um dos casos, confirme que `FERSA_CORS_ORIGINS` no `.env` do
backend inclui a origem que você está usando (ex: `http://127.0.0.1:5500`).

## Estrutura

```
web/
├── index.html
├── css/app.css
└── js/
    ├── config.js          → local, fora do Git (criado a partir do .example)
    ├── config.example.js  → template committado
    ├── data.js             → dados fictícios usados pelo CMS/IA, ainda mock
    ├── icons.js            → ícones SVG inline
    ├── core.js              → sessão, roteador por hash, toasts, modal
    ├── api.js                → fala com o backend (peças, chamados, login);
    │                           CMS e IA ainda usam os dados mock de data.js
    ├── telas-inicio.js        → login, recuperar senha, início, busca
    ├── telas-peca.js           → ficha da peça e sub-telas
    ├── telas-ia.js              → Busca por IA (mock) e chamados
    └── telas-admin.js            → CMS (área /admin), ainda mock
```
