/* =====================================================================
   FERSA Care — camada de API (MOCK)
   Toda tela conversa só com este objeto `api`. Quando o backend REST
   existir, basta trocar as implementações abaixo por chamadas fetch()
   mantendo a mesma assinatura — nenhuma tela precisará mudar.
   ===================================================================== */

const LATENCIA = 420; // ms — simula uma chamada de rede real

function atraso(valor, ms = LATENCIA){
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}
function atrasoErro(mensagem, ms = LATENCIA){
  return new Promise((_, reject) => setTimeout(() => reject(new Error(mensagem)), ms));
}

const api = {
  /* ---------------- Autenticação ---------------- */
  login(email, senha){
    const e = (email || "").trim().toLowerCase();
    const usuario = USUARIOS.find(u => u.email.toLowerCase() === e);
    if(!usuario) return atrasoErro("E-mail não encontrado. Confira e tente novamente.");
    if(usuario.senha !== senha) return atrasoErro("Senha incorreta.");
    const { senha: _s, ...semSenha } = usuario;
    return atraso({ ...semSenha });
  },
  recuperarSenha(email){
    if(!email || !email.includes("@")) return atrasoErro("Informe um e-mail válido.");
    return atraso({ enviado: true });
  },

  /* ---------------- Peças / busca tradicional ---------------- */
  buscarPecas(termo, modo){
    const t = (termo || "").trim().toLowerCase();
    const resultado = PECAS.filter(p => {
      if(!t) return true;
      const pn = p.partNumber.toLowerCase().replace(/[\s-]/g, "");
      const tNorm = t.replace(/[\s-]/g, "");
      if(modo === "partNumber") return pn.includes(tNorm);
      if(modo === "categoria") return p.categoria.toLowerCase().includes(t);
      if(modo === "veiculo") return p.aplicacoes.some(a => a.veiculo.toLowerCase().includes(t));
      if(modo === "modelo") return p.aplicacoes.some(a => a.modelo.toLowerCase().includes(t));
      if(modo === "aplicacao") return p.aplicacoes.some(a => (a.veiculo + " " + a.modelo).toLowerCase().includes(t));
      return (
        pn.includes(tNorm) ||
        p.nome.toLowerCase().includes(t) ||
        p.categoria.toLowerCase().includes(t) ||
        p.aplicacoes.some(a => (a.veiculo + " " + a.modelo).toLowerCase().includes(t))
      );
    });
    return atraso(resultado);
  },
  buscarPecaPorId(id){
    const peca = PECAS.find(p => p.id === Number(id));
    if(!peca) return atrasoErro("Peça não encontrada.");
    return atraso(peca);
  },
  listarTodasPecas(){
    return atraso(PECAS);
  },
  ferramentasDaPeca(peca){
    return (peca.ferramentas || []).map(id => FERRAMENTAS_POR_ID[id]).filter(Boolean);
  },
  problemasDaPeca(peca){
    return (peca.problemas || []).map(id => PROBLEMAS_POR_ID[id]).filter(Boolean);
  },
  manualDaPeca(peca){
    return MANUAIS[peca.manualId] || null;
  },

  /* ---------------- Consultas recentes (por sessão do navegador) ---------------- */
  registrarConsultaRecente(peca){
    try{
      const chave = "fersa_recentes";
      let lista = JSON.parse(localStorage.getItem(chave) || "[]");
      lista = lista.filter(id => id !== peca.id);
      lista.unshift(peca.id);
      lista = lista.slice(0, 5);
      localStorage.setItem(chave, JSON.stringify(lista));
    }catch(e){ /* localStorage indisponível — segue sem recentes */ }
  },
  consultasRecentes(){
    try{
      const chave = "fersa_recentes";
      const ids = JSON.parse(localStorage.getItem(chave) || "[]");
      return atraso(ids.map(id => PECAS.find(p => p.id === id)).filter(Boolean));
    }catch(e){ return atraso([]); }
  },

  /* ---------------- Busca por IA (mock — futuro RAG) ---------------- */
  perguntarIA(pergunta, pecaId){
    const texto = (pergunta || "").trim();
    if(!texto) return atrasoErro("Digite uma pergunta.");
    const textoNorm = texto.toLowerCase();

    // 1) tenta identificar Part Number citado na pergunta (padrão FRS-####)
    const matchPN = textoNorm.match(/frs[\s-]?(\d{3,4})/i);
    let contexto = pecaId ? PECAS.find(p => p.id === Number(pecaId)) : null;
    if(!contexto && matchPN){
      contexto = PECAS.find(p => p.partNumber.toLowerCase().replace(/[\s-]/g, "") === ("frs" + matchPN[1]));
    }

    // 2) busca por palavra-chave na base simulada, priorizando a peça de contexto
    let candidatos = IA_BASE.filter(item => item.palavrasChave.some(k => textoNorm.includes(k)));
    if(contexto){
      const doContexto = candidatos.filter(c => c.pecaId === contexto.id || c.pecaId === null);
      if(doContexto.length) candidatos = doContexto;
    }

    const registro = {
      id: "consulta-" + Date.now(),
      pergunta: texto,
      pecaContexto: contexto ? contexto.partNumber : null,
      respondidoEm: new Date().toLocaleString("pt-BR")
    };

    if(!candidatos.length){
      return atraso({
        ...registro,
        encontrouConteudo: false,
        resposta: "Não encontrei informação suficiente nos materiais disponíveis. Consulte um técnico ou abra um chamado de suporte.",
        fontes: [],
        sugestoesPeca: contexto ? [] : PECAS.slice(0, 3)
      }, LATENCIA + 500);
    }

    const escolhida = candidatos[0];
    return atraso({
      ...registro,
      encontrouConteudo: true,
      resposta: escolhida.resposta,
      fontes: escolhida.fontes,
      pecaRelacionadaId: escolhida.pecaId || (contexto ? contexto.id : null)
    }, LATENCIA + 500);
  },

  /* ---------------- Chamados ---------------- */
  abrirChamado(dados){
    SEQ_CHAMADO += 1;
    const novo = {
      id: SEQ_CHAMADO,
      protocolo: "FC-2026-" + SEQ_CHAMADO,
      status: "ABERTO",
      prioridade: dados.prioridade || "MEDIA",
      assunto: dados.assunto,
      descricao: dados.descricao,
      partNumber: dados.partNumber || null,
      pecaId: dados.pecaId || null,
      aplicacao: dados.aplicacao || null,
      solicitante: dados.solicitante || "Mecânico",
      origemIA: !!dados.origemIA,
      consultaIA: dados.consultaIA || null,
      abertoEm: new Date().toLocaleString("pt-BR"),
      atualizadoEm: new Date().toLocaleString("pt-BR"),
      historico: [{ data: new Date().toLocaleString("pt-BR"), texto: "Chamado aberto" + (dados.origemIA ? " a partir da Busca por IA." : ".") }],
      solucaoTecnico: null
    };
    CHAMADOS.unshift(novo);
    return atraso(novo, LATENCIA + 300);
  },
  listarChamados(filtro){
    let lista = CHAMADOS;
    if(filtro && filtro !== "TODOS") lista = lista.filter(c => c.status === filtro);
    return atraso(lista);
  },
  buscarChamadoPorId(id){
    const chamado = CHAMADOS.find(c => c.id === Number(id));
    if(!chamado) return atrasoErro("Chamado não encontrado.");
    return atraso(chamado);
  },
  registrarSolucao(id, solucao){
    const chamado = CHAMADOS.find(c => c.id === Number(id));
    if(!chamado) return atrasoErro("Chamado não encontrado.");
    chamado.status = "RESOLVIDO";
    chamado.solucaoTecnico = solucao;
    chamado.atualizadoEm = new Date().toLocaleString("pt-BR");
    chamado.historico.push({ data: chamado.atualizadoEm, texto: "Solução registrada: " + solucao });
    return atraso(chamado);
  },
  assumirChamado(id, tecnico){
    const chamado = CHAMADOS.find(c => c.id === Number(id));
    if(!chamado) return atrasoErro("Chamado não encontrado.");
    chamado.status = "EM_ATENDIMENTO";
    chamado.atualizadoEm = new Date().toLocaleString("pt-BR");
    chamado.historico.push({ data: chamado.atualizadoEm, texto: `Técnico ${tecnico} assumiu o chamado.` });
    return atraso(chamado);
  },

  /* ---------------- CMS: Peças ---------------- */
  cmsListarPecas(){ return atraso(PECAS); },
  cmsSalvarPeca(dados){
    if(dados.id){
      const idx = PECAS.findIndex(p => p.id === Number(dados.id));
      if(idx >= 0) PECAS[idx] = { ...PECAS[idx], ...dados, id: PECAS[idx].id };
      return atraso(PECAS[idx]);
    }
    const novo = { id: Math.max(0, ...PECAS.map(p => p.id)) + 1, aplicacoes: [], videos: [], passos: [], ferramentas: [], problemas: [], lubrificacao: {}, ...dados };
    PECAS.push(novo);
    return atraso(novo);
  },
  cmsExcluirPeca(id){
    const idx = PECAS.findIndex(p => p.id === Number(id));
    if(idx >= 0) PECAS.splice(idx, 1);
    return atraso({ ok: true });
  },

  /* ---------------- CMS: Ferramentas / Problemas ---------------- */
  cmsListarFerramentas(){ return atraso(FERRAMENTAS); },
  cmsListarProblemas(){ return atraso(PROBLEMAS); },
  cmsListarManuais(){ return atraso(Object.values(MANUAIS)); },

  /* ---------------- CMS: Base de conhecimento ---------------- */
  cmsListarDocumentos(){ return atraso(BASE_CONHECIMENTO); },
  cmsReindexarDocumento(id){
    const doc = BASE_CONHECIMENTO.find(d => d.id === id);
    if(!doc) return atrasoErro("Documento não encontrado.");
    doc.status = "PROCESSANDO";
    return atraso(doc, 200).then(async () => {
      await atraso(null, 900);
      doc.status = "INDEXADO";
      doc.chunks = doc.chunks || Math.floor(Math.random() * 10) + 8;
      doc.atualizadoEm = new Date().toLocaleDateString("pt-BR");
      delete doc.erro;
      return doc;
    });
  },

  /* ---------------- CMS: Dashboard ---------------- */
  cmsEstatisticas(){
    return atraso({
      totalPecas: PECAS.length,
      totalManuais: Object.keys(MANUAIS).length,
      totalTutoriais: PECAS.reduce((n, p) => n + (p.passos ? 1 : 0), 0),
      totalVideos: PECAS.reduce((n, p) => n + (p.videos ? p.videos.length : 0), 0),
      totalFerramentas: FERRAMENTAS.length,
      totalProblemas: PROBLEMAS.length,
      documentosIndexados: BASE_CONHECIMENTO.filter(d => d.status === "INDEXADO").length,
      documentosTotal: BASE_CONHECIMENTO.length,
      chamadosAbertos: CHAMADOS.filter(c => c.status !== "RESOLVIDO").length,
      porCategoria: Object.entries(
        PECAS.reduce((acc, p) => { acc[p.categoria] = (acc[p.categoria] || 0) + 1; return acc; }, {})
      ),
      lacunasIA: [
        { pergunta: "Qual o torque do parafuso de fixação do FRS-1005?", quando: "20/09/2026" },
        { pergunta: "Posso usar graxa de cálcio no lugar da EP2?", quando: "19/09/2026" }
      ]
    });
  },

  /* ---------------- CMS: Usuários ---------------- */
  cmsListarUsuarios(){ return atraso(USUARIOS.map(({ senha, ...u }) => u)); }
};

/* ---------------- Integração REST (catálogo, sessão e chamados) ----------------
   O backend desta fase não possui CMS de escrita nem endpoints de IA/RAG.
   Os métodos dessas áreas permanecem no mock acima até a próxima fase. */
function apiUrl(path){ return FERSA_CONFIG.apiUrl.replace(/\/$/, "") + path; }
function validarConfigSupabase(){
  if(!FERSA_CONFIG.supabaseUrl || !FERSA_CONFIG.supabaseAnonKey){
    throw new Error("Configure supabaseUrl e supabaseAnonKey em js/config.js para habilitar o login.");
  }
}
async function requisicaoBackend(path, opcoes = {}){
  const sessao = Sessao.atual();
  const headers = { "Content-Type": "application/json", ...(opcoes.headers || {}) };
  if(sessao?.accessToken) headers.Authorization = `Bearer ${sessao.accessToken}`;
  const resposta = await fetch(apiUrl(path), { ...opcoes, headers });
  const texto = await resposta.text();
  let dados;
  try{ dados = texto ? JSON.parse(texto) : null; }catch(e){ dados = texto; }
  if(!resposta.ok){
    const mensagem = dados?.mensagem || dados?.erro || dados?.message || `Falha na API (${resposta.status}).`;
    throw new Error(mensagem);
  }
  return dados;
}
function dataLegivel(valor){
  if(!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? valor : d.toLocaleString("pt-BR");
}
function normalizarPeca(p){
  const ferramentasDTO = p.ferramentas || [];
  const problemasDTO = p.problemas || [];
  return {
    ...p,
    imagem: p.imagemDescricao || p.imagem || "",
    cuidadosInstalacao: p.cuidadosInstalacao || [],
    errosComunsInstalacao: p.errosComunsInstalacao || [],
    passos: (p.passos || []).slice().sort((a,b) => (a.ordem || 0) - (b.ordem || 0)),
    videos: (p.videos || []).map(v => ({ ...v, duracao: v.duracao || (v.duracaoSegundos ? `${Math.floor(v.duracaoSegundos/60)}:${String(v.duracaoSegundos%60).padStart(2,"0")}` : "") })),
    ferramentas: ferramentasDTO.map(f => f.id || f),
    ferramentasDTO,
    problemas: problemasDTO.map(pr => pr.id || pr),
    problemasDTO,
    manualId: null
  };
}
function normalizarChamado(c){
  return { ...c, id: c.id, solicitante: c.solicitanteNome, aplicacao: c.aplicacaoTexto,
    origemIA: c.origemIa, abertoEm: dataLegivel(c.criadoEm), atualizadoEm: dataLegivel(c.atualizadoEm),
    historico: (c.historico || []).map(h => ({ ...h, data: dataLegivel(h.criadoEm || h.data) })) };
}
Object.assign(api, {
  async login(email, senha){
    validarConfigSupabase();
    const base = FERSA_CONFIG.supabaseUrl.replace(/\/$/, "");
    const auth = await fetch(`${base}/auth/v1/token?grant_type=password`, {
      method: "POST", headers: { "Content-Type": "application/json", apikey: FERSA_CONFIG.supabaseAnonKey },
      body: JSON.stringify({ email: (email || "").trim(), password: senha })
    });
    const credenciais = await auth.json().catch(() => ({}));
    if(!auth.ok) throw new Error(credenciais.msg || credenciais.message || credenciais.error_description || "Não foi possível entrar. Confira e-mail e senha.");
    const perfil = await requisicaoBackend("/api/v1/auth/me", { headers: { Authorization: `Bearer ${credenciais.access_token}` } });
    return { id: perfil.id, nome: perfil.nome, perfil: perfil.perfil, oficina: "", accessToken: credenciais.access_token, refreshToken: credenciais.refresh_token };
  },
  async recuperarSenha(email){
    validarConfigSupabase();
    const r = await fetch(`${FERSA_CONFIG.supabaseUrl.replace(/\/$/, "")}/auth/v1/recover`, {
      method: "POST", headers: { "Content-Type": "application/json", apikey: FERSA_CONFIG.supabaseAnonKey }, body: JSON.stringify({ email })
    });
    if(!r.ok) throw new Error("Não foi possível solicitar a recuperação de senha.");
    return { enviado: true };
  },
  async buscarPecas(termo, modo){
    const qs = new URLSearchParams(); if(termo) qs.set("termo", termo); if(modo) qs.set("modo", modo);
    return (await requisicaoBackend(`/api/v1/pecas${qs.size ? `?${qs}` : ""}`)).map(normalizarPeca);
  },
  async buscarPecaPorId(id){ return normalizarPeca(await requisicaoBackend(`/api/v1/pecas/${encodeURIComponent(id)}`)); },
  async listarTodasPecas(){ return (await requisicaoBackend("/api/v1/pecas")).map(normalizarPeca); },
  async consultasRecentes(){
    try{
      const ids = JSON.parse(localStorage.getItem("fersa_recentes") || "[]");
      const pecas = await api.listarTodasPecas();
      return ids.map(id => pecas.find(p => String(p.id) === String(id))).filter(Boolean);
    }catch(e){ return []; }
  },
  ferramentasDaPeca(peca){ return peca.ferramentasDTO || (peca.ferramentas || []).map(id => FERRAMENTAS_POR_ID[id]).filter(Boolean); },
  problemasDaPeca(peca){ return peca.problemasDTO || (peca.problemas || []).map(id => PROBLEMAS_POR_ID[id]).filter(Boolean); },
  async abrirChamado(dados){
    const req = { assunto: dados.assunto, descricao: dados.descricao, pecaId: dados.pecaId || null,
      aplicacaoTexto: dados.aplicacao || null, prioridade: dados.prioridade || "MEDIA" };
    return normalizarChamado(await requisicaoBackend("/api/v1/chamados", { method: "POST", body: JSON.stringify(req) }));
  },
  async listarChamados(filtro){
    const lista = (await requisicaoBackend("/api/v1/chamados")).map(normalizarChamado);
    return filtro && filtro !== "TODOS" ? lista.filter(c => c.status === filtro) : lista;
  },
  async buscarChamadoPorId(id){ return normalizarChamado(await requisicaoBackend(`/api/v1/chamados/${encodeURIComponent(id)}`)); },
  async registrarSolucao(id, solucao){ return normalizarChamado(await requisicaoBackend(`/api/v1/chamados/${encodeURIComponent(id)}/solucao`, { method: "POST", body: JSON.stringify({ solucao }) })); },
  async assumirChamado(id){ return normalizarChamado(await requisicaoBackend(`/api/v1/chamados/${encodeURIComponent(id)}/assumir`, { method: "POST" })); }
});
