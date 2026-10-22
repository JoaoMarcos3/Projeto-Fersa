/* =====================================================================
   FERSA Care — CMS (área administrativa)
   Tudo funciona sobre Mock API. Nenhuma escrita persiste em banco.
   ===================================================================== */

const MENU_ADMIN = [
  { id: "", label: "Dashboard", ico: "dashboard" },
  { id: "pecas", label: "Peças", ico: "peca" },
  { id: "aplicacoes", label: "Aplicações", ico: "peca" },
  { id: "manuais", label: "Manuais", ico: "manual" },
  { id: "tutoriais", label: "Tutoriais", ico: "instalar" },
  { id: "videos", label: "Vídeos", ico: "video" },
  { id: "ferramentas", label: "Ferramentas", ico: "ferramentas" },
  { id: "problemas", label: "Problemas", ico: "problema" },
  { id: "solucoes", label: "Soluções", ico: "check" },
  { id: "documentos", label: "Documentos", ico: "documento" },
  { id: "base-conhecimento", label: "Base de conhecimento", ico: "base" },
  { id: "chamados", label: "Chamados", ico: "chamado" },
  { id: "usuarios", label: "Usuários", ico: "usuario" }
];

function montarAdmin(secaoAtiva, htmlDireita){
  const sessao = Sessao.atual();
  montarConteudo(`
    <div class="admin-grade">
      <aside class="admin-menu">
        <nav>
          ${MENU_ADMIN.filter(i => i.id !== "usuarios" || sessao.perfil === "ADMIN").map(i => `
            <a href="#/admin${i.id ? "/" + i.id : ""}" class="${secaoAtiva === i.id ? "ativo" : ""}">${ICONES[i.ico]}${esc(i.label)}</a>`).join("")}
        </nav>
      </aside>
      <div class="admin-conteudo">
        <span class="tag-cms" style="margin-bottom:12px;display:inline-block;">CMS · ${esc(rotuloPerfil(sessao.perfil))}</span>
        <div class="aviso-prototipo" style="margin:0 0 16px;">O backend atual ainda não implementa o CMS. Alterações feitas nestas telas administrativas são apenas demonstrativas e não ficam salvas no banco.</div>
        ${htmlDireita}
      </div>
    </div>`);
}

function cabAdmin(titulo, subtitulo, acaoHtml){
  return `<div class="cab-tela"><div><h1>${esc(titulo)}</h1>${subtitulo ? `<p>${esc(subtitulo)}</p>` : ""}</div>${acaoHtml || ""}</div>`;
}

/* ---------------- Dashboard ---------------- */
rota("/admin", () => {
  montarAdmin("", estadoCarregando("Carregando dashboard…"));
  api.cmsEstatisticas().then(s => {
    const maiorCategoria = Math.max(1, ...s.porCategoria.map(([, n]) => n));
    montarAdmin("", `
      ${cabAdmin("Dashboard", "Visão geral do conteúdo disponível para o mecânico e para a IA.")}
      <div class="stats">
        <a class="stat" href="#/admin/pecas"><div class="num">${s.totalPecas}</div><div class="rot">Peças cadastradas</div></a>
        <a class="stat" href="#/admin/manuais"><div class="num">${s.totalManuais}</div><div class="rot">Manuais</div></a>
        <a class="stat" href="#/admin/tutoriais"><div class="num">${s.totalTutoriais}</div><div class="rot">Tutoriais</div></a>
        <a class="stat" href="#/admin/videos"><div class="num">${s.totalVideos}</div><div class="rot">Vídeos</div></a>
        <a class="stat" href="#/admin/ferramentas"><div class="num">${s.totalFerramentas}</div><div class="rot">Ferramentas</div></a>
        <a class="stat" href="#/admin/problemas"><div class="num">${s.totalProblemas}</div><div class="rot">Problemas cadastrados</div></a>
        <a class="stat destaque" href="#/admin/base-conhecimento"><div class="num">${s.documentosIndexados}/${s.documentosTotal}</div><div class="rot">Documentos indexados para IA</div><div class="sub">Base de conhecimento</div></a>
        <a class="stat" href="#/admin/chamados"><div class="num">${s.chamadosAbertos}</div><div class="rot">Chamados em aberto</div></a>
      </div>

      <div class="dash-grade">
        <div class="painel">
          <h3>Peças por categoria</h3>
          <div class="barras">
            ${s.porCategoria.map(([cat, n]) => `
              <div class="barra-linha"><span>${esc(cat)}</span><div class="trilho"><i style="width:${(n / maiorCategoria) * 100}%"></i></div><span class="val">${n}</span></div>`).join("")}
          </div>
        </div>
        <div class="painel">
          <h3>Perguntas sem resposta suficiente</h3>
          <p style="margin-bottom:10px;">Sinal de conteúdo que ainda falta cadastrar.</p>
          <ul class="lista-lacunas">
            ${s.lacunasIA.map(l => `<li>${esc(l.pergunta)}<small>${esc(l.quando)}</small></li>`).join("")}
          </ul>
        </div>
      </div>`);
  });
}, ["ADMIN", "TECNICO"]);

/* ---------------- Peças (CRUD) ---------------- */
rota("/admin/pecas", () => {
  montarAdmin("pecas", estadoCarregando("Carregando peças…"));
  api.cmsListarPecas().then(pecas => renderListaPecasAdmin(pecas));
}, ["ADMIN", "TECNICO"]);

function renderListaPecasAdmin(pecas, termoAtual){
  montarAdmin("pecas", `
    ${cabAdmin("Peças", "Cadastro de peças e Part Numbers.", `<button class="btn-principal" id="btn-nova-peca">${ICONES.mais} Nova peça</button>`)}
    <div class="barra-ferramentas">
      <div class="campo-busca">${ICONES.busca}<input id="busca-pecas-admin" type="text" placeholder="Buscar por Part Number, nome ou categoria…" value="${esc(termoAtual || "")}"></div>
    </div>
    <div class="tabela-wrap">
      <table class="tabela">
        <thead><tr><th>Part Number</th><th>Nome</th><th>Categoria</th><th>Aplicações</th><th class="col-acoes">Ações</th></tr></thead>
        <tbody>
          ${pecas.map(p => `
            <tr>
              <td data-rot="Part Number" class="mono">${esc(p.partNumber)}</td>
              <td data-rot="Nome">${esc(p.nome)}</td>
              <td data-rot="Categoria">${esc(p.categoria)}</td>
              <td data-rot="Aplicações">${esc(p.aplicacoes.map(a => a.veiculo).join(", "))}</td>
              <td data-rot="Ações" class="col-acoes">
                <a class="btn-fantasma" href="#/peca/${p.id}" title="Visualizar como mecânico">${ICONES.olho}</a>
                <button class="btn-fantasma" data-editar="${p.id}" title="Editar">${ICONES.lapis}</button>
                <button class="btn-fantasma" data-excluir="${p.id}" data-nome="${esc(p.partNumber)}" title="Excluir">${ICONES.lixeira}</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
    ${pecas.length === 0 ? estadoVazio({ titulo: "Nenhuma peça encontrada", texto: "Ajuste o termo buscado ou cadastre uma nova peça." }) : ""}
  `);

  document.getElementById("busca-pecas-admin").addEventListener("input", (e) => {
    const t = e.target.value.trim().toLowerCase();
    api.cmsListarPecas().then(todas => {
      const filtradas = todas.filter(p => !t || (p.partNumber + p.nome + p.categoria).toLowerCase().includes(t));
      renderListaPecasAdmin(filtradas, e.target.value);
      document.getElementById("busca-pecas-admin").focus();
    });
  });
  document.getElementById("btn-nova-peca").addEventListener("click", () => abrirFormularioPeca(null));
  document.querySelectorAll("[data-editar]").forEach(b => b.addEventListener("click", () => {
    const peca = pecas.find(p => p.id === Number(b.getAttribute("data-editar")));
    abrirFormularioPeca(peca);
  }));
  document.querySelectorAll("[data-excluir]").forEach(b => b.addEventListener("click", () => {
    abrirModalConfirmacao({
      titulo: "Excluir peça",
      corpo: `Tem certeza que deseja excluir a peça ${b.getAttribute("data-nome")}? Esta ação não pode ser desfeita.`,
      textoConfirmar: "Excluir", perigo: true,
      aoConfirmar: () => api.cmsExcluirPeca(b.getAttribute("data-excluir")).then(() => {
        toast("Peça excluída.", "ok");
        api.cmsListarPecas().then(renderListaPecasAdmin);
      })
    });
  }));
}

function abrirFormularioPeca(peca){
  const editando = !!peca;
  const fundo = document.createElement("div");
  fundo.className = "modal-fundo";
  fundo.innerHTML = `
    <div class="modal modal-larga" role="dialog" aria-modal="true">
      <div class="modal-cab">
        <h3>${editando ? "Editar peça" : "Nova peça"}</h3>
        <button class="btn-fantasma" data-fechar aria-label="Fechar">✕</button>
      </div>
      <form id="form-peca-admin" class="form-cms">
        <div class="linha-campos">
          <div class="campo"><label for="pf-pn">Part Number</label><input id="pf-pn" type="text" required value="${editando ? esc(peca.partNumber) : ""}"></div>
          <div class="campo"><label for="pf-categoria">Categoria</label><input id="pf-categoria" type="text" required value="${editando ? esc(peca.categoria) : ""}"></div>
        </div>
        <div class="campo"><label for="pf-nome">Nome / descrição</label><input id="pf-nome" type="text" required value="${editando ? esc(peca.nome) : ""}"></div>
        <div class="campo"><label for="pf-veiculo">Veículo / modelo principal <span class="opcional">(demais aplicações continuam no cadastro atual)</span></label><input id="pf-veiculo" type="text" placeholder="Ex: Volvo FH 540" value="${editando ? esc(peca.aplicacoes[0]?.veiculo || "") : ""}"></div>
        <div class="modal-acoes">
          <button type="button" class="btn-fantasma" data-fechar>Cancelar</button>
          <button type="submit" class="btn-principal">${editando ? "Salvar alterações" : "Cadastrar peça"}</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(fundo);
  const fechar = () => fundo.remove();
  fundo.addEventListener("click", (e) => { if(e.target === fundo) fechar(); });
  fundo.querySelectorAll("[data-fechar]").forEach(b => b.addEventListener("click", fechar));

  fundo.querySelector("#form-peca-admin").addEventListener("submit", (e) => {
    e.preventDefault();
    const dados = {
      id: editando ? peca.id : undefined,
      partNumber: fundo.querySelector("#pf-pn").value.trim(),
      categoria: fundo.querySelector("#pf-categoria").value.trim(),
      nome: fundo.querySelector("#pf-nome").value.trim()
    };
    const veiculo = fundo.querySelector("#pf-veiculo").value.trim();
    if(veiculo) dados.aplicacoes = [{ veiculo, modelo: veiculo }, ...(editando ? peca.aplicacoes.slice(1) : [])];
    api.cmsSalvarPeca(dados).then(() => {
      toast(editando ? "Peça atualizada." : "Peça cadastrada.", "ok");
      fechar();
      api.cmsListarPecas().then(renderListaPecasAdmin);
    });
  });
}

/* ---------------- Aplicações (derivado das peças) ---------------- */
rota("/admin/aplicacoes", () => {
  montarAdmin("aplicacoes", estadoCarregando());
  api.cmsListarPecas().then(pecas => {
    const linhas = pecas.flatMap(p => p.aplicacoes.map(a => ({ ...a, pn: p.partNumber, nome: p.nome, pecaId: p.id })));
    montarAdmin("aplicacoes", `
      ${cabAdmin("Aplicações", "Veículos e modelos vinculados a cada peça.")}
      <div class="tabela-wrap"><table class="tabela">
        <thead><tr><th>Veículo</th><th>Modelo</th><th>Peça vinculada</th><th class="col-acoes">Ações</th></tr></thead>
        <tbody>${linhas.map(l => `<tr>
          <td data-rot="Veículo">${esc(l.veiculo)}</td>
          <td data-rot="Modelo">${esc(l.modelo)}</td>
          <td data-rot="Peça">${esc(l.pn)} — ${esc(l.nome)}</td>
          <td data-rot="Ações" class="col-acoes"><a class="btn-fantasma" href="#/admin/pecas" title="Editar na peça">${ICONES.lapis}</a></td>
        </tr>`).join("")}</tbody>
      </table></div>`);
  });
}, ["ADMIN", "TECNICO"]);

/* ---------------- Manuais ---------------- */
rota("/admin/manuais", () => {
  montarAdmin("manuais", estadoCarregando());
  api.cmsListarManuais().then(manuais => {
    montarAdmin("manuais", `
      ${cabAdmin("Manuais", "Referências de manual associadas a cada peça — hoje simuladas localmente, futuramente vindas do SharePoint.")}
      <div class="tabela-wrap"><table class="tabela">
        <thead><tr><th>Título</th><th>Versão</th><th>Atualizado em</th><th>Origem</th><th class="col-acoes">Ações</th></tr></thead>
        <tbody>${manuais.map(m => `<tr>
          <td data-rot="Título">${esc(m.titulo)}</td>
          <td data-rot="Versão">${esc(m.versao)}</td>
          <td data-rot="Atualizado">${esc(m.atualizadoEm)}</td>
          <td data-rot="Origem">${esc(m.origem)}</td>
          <td data-rot="Ações" class="col-acoes">
            <a class="btn-fantasma" href="#/peca/${m.id.replace('man-frs', '')}/manual" title="Visualizar">${ICONES.olho}</a>
          </td>
        </tr>`).join("")}</tbody>
      </table></div>`);
  });
}, ["ADMIN", "TECNICO"]);

/* ---------------- Tutoriais (passo a passo por peça) ---------------- */
rota("/admin/tutoriais", () => {
  montarAdmin("tutoriais", estadoCarregando());
  api.cmsListarPecas().then(pecas => {
    montarAdmin("tutoriais", `
      ${cabAdmin("Tutoriais", "Passo a passo de instalação, um por peça.")}
      <div class="tabela-wrap"><table class="tabela">
        <thead><tr><th>Peça</th><th>Passos</th><th class="col-acoes">Ações</th></tr></thead>
        <tbody>${pecas.map(p => `<tr>
          <td data-rot="Peça"><span class="mono">${esc(p.partNumber)}</span> ${esc(p.nome)}</td>
          <td data-rot="Passos">${p.passos.length} passo(s)</td>
          <td data-rot="Ações" class="col-acoes"><a class="btn-fantasma" href="#/peca/${p.id}/instalacao" title="Visualizar">${ICONES.olho}</a></td>
        </tr>`).join("")}</tbody>
      </table></div>`);
  });
}, ["ADMIN", "TECNICO"]);

/* ---------------- Vídeos ---------------- */
rota("/admin/videos", () => {
  montarAdmin("videos", estadoCarregando());
  api.cmsListarPecas().then(pecas => {
    const linhas = pecas.flatMap(p => p.videos.map(v => ({ ...v, pn: p.partNumber, pecaId: p.id })));
    montarAdmin("videos", `
      ${cabAdmin("Vídeos", "Vídeos curtos vinculados às peças.")}
      <div class="tabela-wrap"><table class="tabela">
        <thead><tr><th>Título</th><th>Duração</th><th>Peça</th><th class="col-acoes">Ações</th></tr></thead>
        <tbody>${linhas.map(v => `<tr>
          <td data-rot="Título">${esc(v.titulo)}</td>
          <td data-rot="Duração">${esc(v.duracao)}</td>
          <td data-rot="Peça" class="mono">${esc(v.pn)}</td>
          <td data-rot="Ações" class="col-acoes"><a class="btn-fantasma" href="#/peca/${v.pecaId}/videos" title="Visualizar">${ICONES.olho}</a></td>
        </tr>`).join("")}</tbody>
      </table></div>`);
  });
}, ["ADMIN", "TECNICO"]);

/* ---------------- Ferramentas (catálogo) ---------------- */
rota("/admin/ferramentas", () => {
  montarAdmin("ferramentas", estadoCarregando());
  api.cmsListarFerramentas().then(lista => renderListaFerramentasAdmin(lista));
}, ["ADMIN", "TECNICO"]);

function renderListaFerramentasAdmin(lista){
  montarAdmin("ferramentas", `
    ${cabAdmin("Ferramentas", "Catálogo reutilizado entre as peças.")}
    <div class="tabela-wrap"><table class="tabela">
      <thead><tr><th>Nome</th><th>Uso</th><th>Descrição</th><th class="col-acoes">Ações</th></tr></thead>
      <tbody>${lista.map(f => `<tr>
        <td data-rot="Nome">${esc(f.nome)}</td>
        <td data-rot="Uso">${esc(f.uso)}</td>
        <td data-rot="Descrição">${esc(f.descricao)}</td>
        <td data-rot="Ações" class="col-acoes"><button class="btn-fantasma" data-ver-ferramenta="${f.id}" title="Visualizar">${ICONES.olho}</button></td>
      </tr>`).join("")}</tbody>
    </table></div>`);
  document.querySelectorAll("[data-ver-ferramenta]").forEach(b => b.addEventListener("click", () => {
    const f = lista.find(x => x.id === b.getAttribute("data-ver-ferramenta"));
    abrirModalVisualizar(f.nome, `<p><strong>Uso:</strong> ${esc(f.uso)}</p><p style="margin-top:8px;"><strong>Descrição:</strong> ${esc(f.descricao)}</p><p style="margin-top:8px;"><strong>Procedimento:</strong> ${esc(f.procedimento)}</p>`);
  }));
}

/* ---------------- Problemas / Soluções (catálogo) ---------------- */
rota("/admin/problemas", () => {
  montarAdmin("problemas", estadoCarregando());
  api.cmsListarProblemas().then(lista => renderListaProblemasAdmin(lista));
}, ["ADMIN", "TECNICO"]);
rota("/admin/solucoes", () => {
  montarAdmin("solucoes", estadoCarregando());
  api.cmsListarProblemas().then(lista => renderListaProblemasAdmin(lista, true));
}, ["ADMIN", "TECNICO"]);

function renderListaProblemasAdmin(lista, focoSolucao){
  const secao = focoSolucao ? "solucoes" : "problemas";
  montarAdmin(secao, `
    ${cabAdmin(focoSolucao ? "Soluções" : "Problemas", focoSolucao ? "Solução aplicada a cada problema catalogado." : "Problemas comuns, catalogados por causa provável.")}
    <div class="tabela-wrap"><table class="tabela">
      <thead><tr><th>Problema</th><th>${focoSolucao ? "Solução" : "Causa provável"}</th><th class="col-acoes">Ações</th></tr></thead>
      <tbody>${lista.map(p => `<tr>
        <td data-rot="Problema">${esc(p.titulo)}</td>
        <td data-rot="${focoSolucao ? "Solução" : "Causa"}">${esc(focoSolucao ? p.solucao : p.causas)}</td>
        <td data-rot="Ações" class="col-acoes"><button class="btn-fantasma" data-ver-problema="${p.id}" title="Visualizar">${ICONES.olho}</button></td>
      </tr>`).join("")}</tbody>
    </table></div>`);
  document.querySelectorAll("[data-ver-problema]").forEach(b => b.addEventListener("click", () => {
    const p = lista.find(x => x.id === b.getAttribute("data-ver-problema"));
    abrirModalVisualizar(p.titulo, `
      <p><strong>Causas:</strong> ${esc(p.causas)}</p>
      <p style="margin-top:8px;"><strong>O que verificar:</strong> ${p.verificar.map(esc).join(", ")}</p>
      <p style="margin-top:8px;"><strong>Solução:</strong> ${esc(p.solucao)}</p>
      <p style="margin-top:8px;"><strong>Quando procurar suporte:</strong> ${esc(p.quandoTecnico)}</p>`);
  }));
}

function abrirModalVisualizar(titulo, corpoHtml){
  const fundo = document.createElement("div");
  fundo.className = "modal-fundo";
  fundo.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
    <div class="modal-cab"><h3>${esc(titulo)}</h3><button class="btn-fantasma" data-fechar aria-label="Fechar">✕</button></div>
    <div class="modal-corpo">${corpoHtml}</div>
    <div class="modal-acoes"><button class="btn-principal" data-fechar>Fechar</button></div>
  </div>`;
  document.body.appendChild(fundo);
  const fechar = () => fundo.remove();
  fundo.addEventListener("click", (e) => { if(e.target === fundo) fechar(); });
  fundo.querySelectorAll("[data-fechar]").forEach(b => b.addEventListener("click", fechar));
}

/* ---------------- Usuários ---------------- */
rota("/admin/usuarios", () => {
  montarAdmin("usuarios", estadoCarregando());
  api.cmsListarUsuarios().then(lista => {
    montarAdmin("usuarios", `
      ${cabAdmin("Usuários", "Contas de acesso ao FERSA Care.")}
      <div class="tabela-wrap"><table class="tabela">
        <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th></tr></thead>
        <tbody>${lista.map(u => `<tr>
          <td data-rot="Nome">${esc(u.nome)}</td>
          <td data-rot="E-mail">${esc(u.email)}</td>
          <td data-rot="Perfil"><span class="badge b-info">${esc(rotuloPerfil(u.perfil))}</span></td>
        </tr>`).join("")}</tbody>
      </table></div>`);
  });
}, ["ADMIN"]);

/* ---------------- Documentos (visão simplificada da Base de conhecimento) ---------------- */
rota("/admin/documentos", () => { irPara("/admin/base-conhecimento"); }, ["ADMIN", "TECNICO"]);

/* ---------------- Base de conhecimento (CMS ↔ RAG) ---------------- */
const ROTULO_STATUS_DOC = { RASCUNHO: "Rascunho", PUBLICADO: "Publicado", PROCESSANDO: "Processando", INDEXADO: "Indexado", DESATUALIZADO: "Desatualizado", ERRO: "Erro" };
const CLASSE_STATUS_DOC = { RASCUNHO: "b-alerta", PUBLICADO: "b-info", PROCESSANDO: "b-info", INDEXADO: "b-ok", DESATUALIZADO: "b-alerta", ERRO: "b-erro" };

rota("/admin/base-conhecimento", () => {
  montarAdmin("base-conhecimento", estadoCarregando());
  api.cmsListarDocumentos().then(docs => renderBaseConhecimento(docs));
}, ["ADMIN", "TECNICO"]);

function renderBaseConhecimento(docs){
  montarAdmin("base-conhecimento", `
    ${cabAdmin("Base de conhecimento", "Como o conteúdo é preparado para alimentar a Busca por IA (RAG). Nesta etapa é só representação visual — nenhum embedding real é gerado.")}

    <div class="painel">
      <h3>Como um conteúdo chega até a IA</h3>
      <div class="fluxo-pipeline">
        <div class="etapa-pipe"><strong>1. Cadastro</strong><span>CMS: peça, problema, manual…</span></div>
        <div class="etapa-pipe"><strong>2. Publicação</strong><span>Conteúdo vira documento</span></div>
        <div class="etapa-pipe"><strong>3. Divisão</strong><span>Trechos (chunks)</span></div>
        <div class="etapa-pipe"><strong>4. Embeddings</strong><span>Representação vetorial</span></div>
        <div class="etapa-pipe"><strong>5. Base vetorial</strong><span>Pronto para busca</span></div>
        <div class="etapa-pipe"><strong>6. RAG + IA</strong><span>Resposta com fonte</span></div>
      </div>
    </div>

    <div class="tabela-wrap">
      <table class="tabela">
        <thead><tr><th>Documento</th><th>Tipo</th><th>Origem</th><th>Chunks</th><th>Status</th><th>Disponível p/ IA</th><th class="col-acoes">Ações</th></tr></thead>
        <tbody id="corpo-docs">
          ${docs.map(d => linhaDocumento(d)).join("")}
        </tbody>
      </table>
    </div>

    <div class="painel" style="margin-top:20px;">
      <h3>Testar recuperação (simulação)</h3>
      <p style="margin-bottom:10px;">Digite uma pergunta para ver, de forma simplificada, o que seria recuperado da base — a mesma lógica usada na tela "Perguntar à IA".</p>
      <div class="teste-rec">
        <input id="teste-recuperacao" type="text" placeholder="Ex: rolamento aquecendo depois da montagem">
        <button class="btn-secundario" id="btn-testar-rec">Testar</button>
      </div>
      <div id="resultado-teste-rec" style="margin-top:12px;"></div>
    </div>
  `);
  ligarBaseConhecimento(docs);
}

function linhaDocumento(d){
  const peca = d.pecaId ? PECAS.find(p => p.id === d.pecaId) : null;
  return `<tr data-linha-doc="${d.id}">
    <td data-rot="Documento"><strong>${esc(d.titulo)}</strong>${peca ? `<br><small style="color:var(--text-muted);">${esc(peca.partNumber)}</small>` : ""}${d.erro ? `<div class="erro-doc">${esc(d.erro)}</div>` : ""}</td>
    <td data-rot="Tipo">${esc(d.tipo)}</td>
    <td data-rot="Origem">${esc(d.origem)}</td>
    <td data-rot="Chunks">${d.chunks}</td>
    <td data-rot="Status"><span class="badge ${CLASSE_STATUS_DOC[d.status]}">${esc(ROTULO_STATUS_DOC[d.status])}</span></td>
    <td data-rot="Disponível p/ IA"><label class="interruptor"><input type="checkbox" ${d.status === "INDEXADO" ? "checked disabled" : "disabled"}><i></i></label></td>
    <td data-rot="Ações" class="col-acoes">
      <button class="btn-fantasma" data-reindexar="${d.id}" title="Reindexar" ${d.status === "PROCESSANDO" ? "disabled" : ""}>${ICONES.atualizar}</button>
    </td>
  </tr>`;
}

function ligarBaseConhecimento(docsIniciais){
  document.getElementById("corpo-docs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-reindexar]");
    if(!btn) return;
    const id = btn.getAttribute("data-reindexar");
    const linha = document.querySelector(`[data-linha-doc="${id}"]`);
    linha.querySelector("td[data-rot='Status'] .badge").className = "badge b-info";
    linha.querySelector("td[data-rot='Status'] .badge").textContent = "Processando";
    btn.disabled = true;
    api.cmsReindexarDocumento(id).then(doc => {
      const nova = document.createElement("tbody");
      nova.innerHTML = linhaDocumento(doc);
      linha.replaceWith(nova.firstElementChild);
      toast(`"${doc.titulo}" reindexado com sucesso.`, "ok");
    });
  });

  document.getElementById("btn-testar-rec").addEventListener("click", () => {
    const termo = document.getElementById("teste-recuperacao").value.trim();
    const cont = document.getElementById("resultado-teste-rec");
    if(!termo){ cont.innerHTML = ""; return; }
    cont.innerHTML = estadoCarregando("Buscando trechos relevantes…");
    api.perguntarIA(termo, null).then(res => {
      if(!res.encontrouConteudo){
        cont.innerHTML = `<div class="aviso aviso-cuidado"><h4>${ICONES.alerta} Nenhum trecho relevante encontrado</h4><p>Esta pergunta cairia na resposta padrão de "informação insuficiente".</p></div>`;
        return;
      }
      cont.innerHTML = res.fontes.map(f => `<div class="chunk-item"><strong>${esc(f.documento)} — ${esc(f.secao)}</strong><p>${esc(f.trecho)}</p></div>`).join("");
    });
  });
}
