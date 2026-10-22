/* =====================================================================
   FERSA Care — Busca por IA (mock do RAG) e Chamados
   ===================================================================== */

const EXEMPLOS_IA = [
  "Como instalar esse rolamento?",
  "Qual ferramenta devo utilizar?",
  "Meu rolamento está aquecendo depois da montagem, o que devo verificar?",
  "Como devo fazer a lubrificação?"
];

/* ---------------- Pergunte ao FERSA Care ---------------- */
rota("/ia", () => {
  const query = obterQuery();
  const pecaIdInicial = query.get("peca") || "";
  const perguntaInicial = query.get("pergunta") || "";

  api.listarTodasPecas().then(pecas => {
    montarConteudo(`
      <div class="conteudo">
        <a class="voltar" href="#/inicio">${ICONES.setaEsq} Voltar ao início</a>
        <h1>Pergunte ao FERSA Care</h1>
        <p style="margin-top:6px;">Descreva sua dúvida ou problema, sem precisar de termos técnicos.</p>

        <div class="aviso-prototipo">
          ${ICONES.info}
          <span>Protótipo: as respostas abaixo são simuladas (Mock API). Futuramente esta busca será integrada a um RAG, que consulta a base de conhecimento real cadastrada no CMS.</span>
        </div>

        <div class="contexto-peca">
          <label for="select-peca" style="color:var(--text-muted);">Sobre qual peça é a dúvida?</label>
          <select id="select-peca">
            <option value="">Não sei / buscar em todas</option>
            ${pecas.map(p => `<option value="${p.id}" ${String(p.id) === pecaIdInicial ? "selected" : ""}>${esc(p.partNumber)} — ${esc(p.nome)}</option>`).join("")}
          </select>
        </div>

        <form id="form-ia" class="ia-form">
          <textarea id="campo-pergunta" placeholder="Ex: Meu rolamento está aquecendo depois da montagem. O que devo verificar?">${esc(perguntaInicial)}</textarea>
          <div class="form-acoes">
            <button class="btn-principal" type="submit" id="btn-perguntar">${ICONES.ia} Perguntar</button>
          </div>
        </form>
        <div class="exemplos">
          ${EXEMPLOS_IA.map(ex => `<button class="exemplo" data-exemplo="${esc(ex)}">${esc(ex)}</button>`).join("")}
        </div>

        <details class="como-funciona">
          <summary>Como funciona essa busca?</summary>
          <div class="corpo">
            <p>A resposta é gerada a partir do conteúdo cadastrado no sistema, nunca de conhecimento genérico da IA:</p>
            <div class="fluxo-rag">
              <span>Sua pergunta</span><i>→</i><span>Busca semântica</span><i>→</i><span>Base de conhecimento</span><i>→</i><span>IA</span><i>→</i><span>Resposta com fonte</span>
            </div>
            <p>Se não houver conteúdo suficiente, o sistema informa isso claramente e sugere falar com um técnico — a IA não inventa uma resposta técnica.</p>
          </div>
        </details>

        <div id="ia-thread"></div>
      </div>`);

    ligarIA();
    if(perguntaInicial){
      document.getElementById("form-ia").requestSubmit();
    }
  });
}, ["MECANICO"]);

function ligarIA(){
  const form = document.getElementById("form-ia");
  const campo = document.getElementById("campo-pergunta");
  const selectPeca = document.getElementById("select-peca");
  const thread = document.getElementById("ia-thread");
  let contador = 0;

  document.querySelectorAll("[data-exemplo]").forEach(b => {
    b.addEventListener("click", () => { campo.value = b.getAttribute("data-exemplo"); campo.focus(); });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const pergunta = campo.value.trim();
    if(!pergunta){ toast("Digite uma pergunta antes de enviar.", "erro"); return; }

    // move qualquer resultado anterior para o histórico (colapsado)
    const anterior = thread.querySelector(".ia-resultado.aberto");
    if(anterior){
      const perguntaAnterior = anterior.querySelector(".ia-pergunta p").textContent;
      const resumo = document.createElement("details");
      resumo.className = "ia-anterior";
      resumo.innerHTML = `<summary>${esc(perguntaAnterior)}</summary>`;
      anterior.classList.remove("aberto", "ia-resultado");
      anterior.classList.add("modal-corpo");
      resumo.appendChild(anterior);
      thread.insertBefore(resumo, thread.firstChild);
    }

    contador += 1;
    const idBloco = "ia-res-" + contador;
    const bloco = document.createElement("div");
    bloco.className = "ia-resultado aberto";
    bloco.id = idBloco;
    bloco.innerHTML = `
      <div class="ia-bloco ia-pergunta">
        <div class="ia-rotulo">Sua pergunta</div>
        <p>${esc(pergunta)}</p>
      </div>
      <div class="ia-bloco">
        <div class="thinking">
          <div>${ICONES.busca} Buscando na base de conhecimento…</div>
          <div>${ICONES.documento} Recuperando trechos relevantes…</div>
          <div>${ICONES.ia} Gerando resposta…</div>
        </div>
      </div>`;
    thread.insertBefore(bloco, thread.firstChild);
    campo.value = "";
    document.getElementById("btn-perguntar").disabled = true;

    api.perguntarIA(pergunta, selectPeca.value || null).then(res => {
      document.getElementById("btn-perguntar").disabled = false;
      renderRespostaIA(bloco, res);
    }).catch(err => {
      document.getElementById("btn-perguntar").disabled = false;
      bloco.querySelector(".ia-bloco:last-child").innerHTML = estadoErro({ titulo: "Não foi possível consultar a IA", texto: err.message });
    });
  });
}

function renderRespostaIA(bloco, res){
  const blocoResposta = bloco.querySelector(".ia-bloco:last-child");

  if(!res.encontrouConteudo){
    blocoResposta.innerHTML = `
      <div class="ia-rotulo">Resposta <span class="selo-simulada">Simulada</span></div>
      <div class="ia-resposta sem-info">
        <p>${esc(res.resposta)}</p>
        ${res.sugestoesPeca && res.sugestoesPeca.length ? `
          <h4>Isso é sobre uma destas peças?</h4>
          <div class="sugestoes-peca">
            ${res.sugestoesPeca.map(p => `<button data-abrir-peca="${p.id}"><span class="pn">${esc(p.partNumber)}</span> ${esc(p.nome)}</button>`).join("")}
          </div>` : ""}
      </div>
      <div class="ia-acoes">
        <a class="btn-principal" href="#/chamado/novo?consulta=${encodeURIComponent(res.id)}&assunto=${encodeURIComponent(res.pergunta)}">${ICONES.chamado} Falar com técnico</a>
      </div>`;
    blocoResposta.querySelectorAll("[data-abrir-peca]").forEach(b => b.addEventListener("click", () => irPara("/peca/" + b.getAttribute("data-abrir-peca"))));
    return;
  }

  blocoResposta.innerHTML = `
    <div class="ia-rotulo">Resposta <span class="selo-simulada">Simulada</span></div>
    <div class="ia-resposta">
      <p>${esc(res.resposta)}</p>
      <h4>Fontes consultadas</h4>
      <div class="lista-fontes">
        ${res.fontes.map(f => `
          <div class="fonte-card">
            <div class="txt">
              <strong>${esc(f.documento)}</strong>
              <div class="secao">${esc(f.secao)}</div>
              <blockquote>${esc(f.trecho)}</blockquote>
            </div>
            <div class="grupo-botoes">
              ${f.tipo === "manual" ? `<a class="btn-secundario btn-pequeno" href="#/peca/${f.pecaId}/manual">Ver fonte</a>` : ""}
              ${f.tipo === "problema" && f.pecaId ? `<a class="btn-secundario btn-pequeno" href="#/peca/${f.pecaId}/problemas">Ver procedimento</a>` : ""}
              ${f.tipo === "ferramenta" ? `<a class="btn-secundario btn-pequeno" href="#/busca/ferramentas">Ver procedimento</a>` : ""}
            </div>
          </div>`).join("")}
      </div>
    </div>
    <div class="ia-acoes">
      <div class="ia-feedback" id="feedback-${bloco.id}">
        <span>Isso resolveu sua dúvida?</span>
        <button class="btn-secundario btn-pequeno" data-resolveu="sim">${ICONES.check} Sim</button>
        <button class="btn-secundario btn-pequeno" data-resolveu="nao">Não</button>
      </div>
    </div>`;

  const feedback = blocoResposta.querySelector(`#feedback-${bloco.id}`);
  feedback.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-resolveu]");
    if(!btn) return;
    if(btn.getAttribute("data-resolveu") === "sim"){
      feedback.innerHTML = `${ICONES.check} <span>Ótimo! Obrigado pelo retorno.</span>`;
      toast("Obrigado pelo retorno — isso ajuda a melhorar a base de conhecimento.", "ok");
    }else{
      feedback.innerHTML = `<span>Sem problema. Você pode abrir um chamado com esta conversa anexada.</span>
        <a class="btn-principal btn-pequeno" href="#/chamado/novo?consulta=${encodeURIComponent(res.id)}&peca=${res.pecaRelacionadaId || ""}&assunto=${encodeURIComponent(res.pergunta)}">${ICONES.chamado} Falar com técnico</a>`;
    }
  });
}

/* ---------------- Falar com técnico: abrir chamado ---------------- */
rota("/chamado/novo", () => {
  const query = obterQuery();
  const pecaId = query.get("peca") || "";
  const consultaId = query.get("consulta") || "";
  const assuntoQuery = query.get("assunto") || "";

  api.listarTodasPecas().then(pecas => {
    montarConteudo(`
      <div class="conteudo" style="max-width:640px;">
        <a class="voltar" href="#/inicio">${ICONES.setaEsq} Voltar</a>
        <h1>Falar com técnico</h1>
        <p style="margin-top:6px;">Descreva o problema. Um técnico vai analisar e registrar a solução.</p>
        ${consultaId ? `<div class="contexto-fluxo" style="margin-top:14px;">${ICONES.ia} A conversa com a IA será anexada a este chamado.</div>` : ""}

        <form id="form-chamado" novalidate style="margin-top:18px;">
          <div class="campo">
            <label for="ch-peca">Part Number <span class="opcional">(opcional)</span></label>
            <select id="ch-peca">
              <option value="">Não relacionado a uma peça específica</option>
              ${pecas.map(p => `<option value="${p.id}" ${String(p.id) === pecaId ? "selected" : ""}>${esc(p.partNumber)} — ${esc(p.nome)}</option>`).join("")}
            </select>
          </div>
          <div class="campo" id="campo-assunto">
            <label for="ch-assunto">Assunto</label>
            <input id="ch-assunto" type="text" placeholder="Ex: Rolamento aquecendo após instalação" value="${esc(assuntoQuery)}" required>
          </div>
          <div class="campo" id="campo-descricao">
            <label for="ch-descricao">Descrição do problema</label>
            <textarea id="ch-descricao" placeholder="Explique o que aconteceu, o que já foi verificado…" required></textarea>
          </div>
          <div class="campo">
            <label class="rotulo">Prioridade</label>
            <div class="opcoes-cartao">
              <label class="opcao-cartao"><input type="radio" name="prioridade" value="BAIXA"><span>Baixa<small>Sem urgência</small></span></label>
              <label class="opcao-cartao"><input type="radio" name="prioridade" value="MEDIA" checked><span>Média<small>Padrão</small></span></label>
              <label class="opcao-cartao"><input type="radio" name="prioridade" value="ALTA"><span>Alta<small>Veículo parado</small></span></label>
            </div>
          </div>
          <div class="campo">
            <label for="ch-anexo">Anexar imagem <span class="opcional">(opcional)</span></label>
            <input id="ch-anexo" type="file" accept="image/*">
            <div class="anexo-previa" id="anexo-previa" style="display:none;">${ICONES.clip}<span>Nenhum arquivo enviado ainda — protótipo não faz upload real.</span></div>
          </div>
          <div class="form-acoes">
            <button class="btn-principal" type="submit" id="btn-enviar-chamado">${ICONES.chamado} Enviar chamado</button>
          </div>
        </form>
      </div>`);

    document.getElementById("ch-anexo").addEventListener("change", (e) => {
      const previa = document.getElementById("anexo-previa");
      if(e.target.files[0]){
        previa.style.display = "flex";
        previa.innerHTML = `${ICONES.clip}<span>${esc(e.target.files[0].name)} selecionado (não é enviado neste protótipo).</span>`;
      }
    });

    document.getElementById("form-chamado").addEventListener("submit", (e) => {
      e.preventDefault();
      const assunto = document.getElementById("ch-assunto").value.trim();
      const descricao = document.getElementById("ch-descricao").value.trim();
      document.getElementById("campo-assunto").classList.toggle("invalido", !assunto);
      document.getElementById("campo-descricao").classList.toggle("invalido", !descricao);
      if(!assunto || !descricao){ toast("Preencha assunto e descrição.", "erro"); return; }

      const pecaEscolhidaId = document.getElementById("ch-peca").value;
      const peca = pecas.find(p => String(p.id) === pecaEscolhidaId);
      const sessao = Sessao.atual();
      const btn = document.getElementById("btn-enviar-chamado");
      btn.disabled = true; btn.textContent = "Enviando…";

      api.abrirChamado({
        assunto, descricao,
        partNumber: peca ? peca.partNumber : null,
        pecaId: peca ? peca.id : null,
        aplicacao: peca ? peca.aplicacoes.map(a => a.veiculo).join(", ") : null,
        prioridade: document.querySelector('input[name="prioridade"]:checked').value,
        solicitante: sessao.nome,
        origemIA: !!consultaId,
        consultaIA: consultaId || null
      }).then(chamado => irPara("/chamado/confirmacao/" + chamado.id));
    });
  });
}, ["MECANICO"]);

rota("/chamado/confirmacao/:id", (params) => {
  api.buscarChamadoPorId(params.id).then(c => {
    montarConteudo(`
      <div class="conteudo">
        <div class="confirmacao">
          ${ICONES.check}
          <h2>Chamado enviado</h2>
          <p>Um técnico vai analisar e você será avisado pelo status do chamado.</p>
          <div class="protocolo-grande">${esc(c.protocolo)}</div>
          <dl class="resumo-lista">
            <dt>Assunto</dt><dd>${esc(c.assunto)}</dd>
            ${c.partNumber ? `<dt>Peça</dt><dd>${esc(c.partNumber)}</dd>` : ""}
            <dt>Prioridade</dt><dd>${esc(rotuloPrioridade(c.prioridade))}</dd>
            <dt>Aberto em</dt><dd>${esc(c.abertoEm)}</dd>
          </dl>
          <div class="grupo-botoes">
            <a class="btn-principal" href="#/chamados">Acompanhar meus chamados</a>
            <a class="btn-secundario" href="#/inicio">Voltar ao início</a>
          </div>
        </div>
      </div>`);
  });
}, ["MECANICO"]);

/* ---------------- Meus chamados ---------------- */
function rotuloStatus(s){ return { ABERTO: "Aberto", EM_ATENDIMENTO: "Em atendimento", RESOLVIDO: "Resolvido" }[s] || s; }
function classeStatus(s){ return { ABERTO: "b-alerta", EM_ATENDIMENTO: "b-info", RESOLVIDO: "b-ok" }[s] || ""; }
function rotuloPrioridade(p){ return { BAIXA: "Baixa", MEDIA: "Média", ALTA: "Alta" }[p] || p; }

rota("/chamados", () => {
  montarConteudo(estadoCarregando("Carregando chamados…"));
  const sessao = Sessao.atual();
  api.listarChamados("TODOS").then(todos => {
    const meus = sessao.perfil === "MECANICO" ? todos.filter(c => c.solicitante === sessao.nome) : todos;
    renderListaChamados(meus, sessao);
  });
}, ["MECANICO", "TECNICO", "ADMIN"]);

function renderListaChamados(lista, sessao){
  montarConteudo(`
    <div class="conteudo">
      <div class="cab-tela">
        <div><h1>${sessao.perfil !== "MECANICO" ? "Fila de chamados" : "Meus chamados"}</h1><p>Acompanhe o andamento e as soluções registradas.</p></div>
        ${sessao.perfil === "MECANICO" ? `<a class="btn-principal" href="#/chamado/novo">${ICONES.chamado} Novo chamado</a>` : ""}
      </div>
      <div class="filtros" id="filtros-chamado">
        ${["TODOS", "ABERTO", "EM_ATENDIMENTO", "RESOLVIDO"].map(s => `<button class="modo ${s === "TODOS" ? "ativo" : ""}" data-status="${s}">${s === "TODOS" ? "Todos" : rotuloStatus(s)}</button>`).join("")}
      </div>
      <div id="lista-chamados-cont"></div>
    </div>`);

  function pintar(filtro){
    const cont = document.getElementById("lista-chamados-cont");
    const filtrados = filtro === "TODOS" ? lista : lista.filter(c => c.status === filtro);
    if(!filtrados.length){
      cont.innerHTML = estadoVazio({ titulo: "Nenhum chamado por aqui", texto: sessao.perfil === "MECANICO" ? "Quando você abrir um chamado, ele aparece nesta lista." : "Não há chamados com este filtro." });
      return;
    }
    cont.innerHTML = `<div class="lista-chamados">${filtrados.map(c => `
      <a class="card-chamado" href="#/chamados/${c.id}">
        <div>
          <span class="protocolo">${esc(c.protocolo)}</span>
          <span class="assunto">${esc(c.assunto)}</span>
          <small>${esc(c.partNumber || "Sem peça vinculada")} · Aberto em ${esc(c.abertoEm)}</small>
        </div>
        <span class="badge ${classeStatus(c.status)}">${esc(rotuloStatus(c.status))}</span>
      </a>`).join("")}</div>`;
  }
  pintar("TODOS");
  document.getElementById("filtros-chamado").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-status]");
    if(!btn) return;
    document.querySelectorAll("#filtros-chamado .modo").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    pintar(btn.getAttribute("data-status"));
  });
}

/* ---------------- Detalhe do chamado ---------------- */
rota("/chamados/:id", (params) => {
  montarConteudo(estadoCarregando("Carregando chamado…"));
  api.buscarChamadoPorId(params.id).then(c => renderDetalheChamado(c)).catch(err => {
    montarConteudo(`<div class="conteudo">${estadoErro({ titulo: "Chamado não encontrado", texto: err.message })}</div>`);
  });
}, ["MECANICO", "TECNICO", "ADMIN"]);

function renderDetalheChamado(c){
  const sessao = Sessao.atual();
  const ehTecnico = sessao.perfil === "TECNICO" || sessao.perfil === "ADMIN";
  montarConteudo(`
    <div class="conteudo">
      <a class="voltar" href="#/chamados">${ICONES.setaEsq} Voltar aos chamados</a>
      <div class="cab-tela">
        <div>
          <h1>${esc(c.protocolo)}</h1>
          <p>${esc(c.assunto)}</p>
        </div>
        <span class="badge ${classeStatus(c.status)}">${esc(rotuloStatus(c.status))}</span>
      </div>

      <div class="painel">
        <h3>Detalhes</h3>
        <dl class="chave-valor">
          <dt>Descrição</dt><dd>${esc(c.descricao)}</dd>
          <dt>Peça</dt><dd>${c.partNumber ? `<a href="#/peca/${c.pecaId}" class="link-simples">${esc(c.partNumber)}</a> — ${esc(c.aplicacao || "")}` : "Não vinculada"}</dd>
          <dt>Prioridade</dt><dd>${esc(rotuloPrioridade(c.prioridade))}</dd>
          <dt>Solicitante</dt><dd>${esc(c.solicitante)}</dd>
          <dt>Origem</dt><dd>${c.origemIA ? "Busca por IA" : "Aberto diretamente"}</dd>
        </dl>
      </div>

      ${c.status === "RESOLVIDO" ? `
        <div class="painel" style="border-left:4px solid var(--success);">
          <h3>${ICONES.check} Solução registrada</h3>
          <p>${esc(c.solucaoTecnico)}</p>
        </div>` : ""}

      <div class="painel">
        <h3>${ICONES.historico} Histórico</h3>
        <ul class="linha-tempo">
          ${c.historico.map(h => `<li><strong>${esc(h.texto)}</strong><small>${esc(h.data)}</small></li>`).join("")}
        </ul>
      </div>

      ${ehTecnico ? renderAcoesTecnico(c) : ""}
    </div>`);

  if(ehTecnico) ligarAcoesTecnico(c);
}

function renderAcoesTecnico(c){
  if(c.status === "ABERTO"){
    return `<div class="painel"><h3>Atender chamado</h3><p style="margin-bottom:12px;">Assuma este chamado para começar o atendimento.</p><button class="btn-principal" id="btn-assumir">Assumir chamado</button></div>`;
  }
  if(c.status === "EM_ATENDIMENTO"){
    return `
      <div class="painel">
        <h3>Registrar solução</h3>
        <form id="form-solucao">
          <div class="campo">
            <label for="txt-solucao">O que foi identificado e a solução aplicada</label>
            <textarea id="txt-solucao" placeholder="Descreva a causa raiz e o procedimento realizado…" required></textarea>
          </div>
          <button class="btn-principal" type="submit">${ICONES.check} Registrar solução e concluir</button>
        </form>
      </div>`;
  }
  return "";
}
function ligarAcoesTecnico(c){
  const btnAssumir = document.getElementById("btn-assumir");
  if(btnAssumir){
    btnAssumir.addEventListener("click", () => {
      api.assumirChamado(c.id, Sessao.atual().nome).then(atualizado => { toast("Chamado assumido.", "ok"); renderDetalheChamado(atualizado); });
    });
  }
  const formSolucao = document.getElementById("form-solucao");
  if(formSolucao){
    formSolucao.addEventListener("submit", (e) => {
      e.preventDefault();
      const texto = document.getElementById("txt-solucao").value.trim();
      if(!texto){ toast("Descreva a solução aplicada.", "erro"); return; }
      api.registrarSolucao(c.id, texto).then(atualizado => { toast("Solução registrada.", "ok"); renderDetalheChamado(atualizado); });
    });
  }
}
