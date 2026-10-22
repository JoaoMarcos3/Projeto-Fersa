/* =====================================================================
   FERSA Care — dados fictícios (mock)
   Nenhum dado real da FERSA. Tudo aqui é exemplo para o protótipo.
   ===================================================================== */

/* ---------- Usuários de teste ---------- */
const USUARIOS = [
  { email: "mecanico@oficina.com", senha: "1234", nome: "Carlos Mendes", perfil: "MECANICO", oficina: "Oficina Trevo Diesel" },
  { email: "tecnico@fersa.com", senha: "1234", nome: "Renata Souza", perfil: "TECNICO" },
  { email: "admin@fersa.com", senha: "1234", nome: "Paulo Ferreira", perfil: "ADMIN" }
];

/* ---------- Peças ---------- */
const PECAS = [
  {
    id: 1,
    partNumber: "FRS-1001",
    nome: "Rolamento de Roda Dianteira",
    categoria: "Rolamento de Cubo",
    aplicacoes: [
      { veiculo: "Volvo FH 540", modelo: "FH 540 6x2" },
      { veiculo: "Scania R450", modelo: "R450 Highline" }
    ],
    imagem: "Rolamento cônico de duas carreiras, cor aço fosco",
    videos: [
      { titulo: "Instalação do FRS-1001", duracao: "2:14", tipo: "instalacao" },
      { titulo: "Verificação de folga após montagem", duracao: "1:05", tipo: "instalacao" }
    ],
    passos: [
      { titulo: "Limpeza do alojamento", texto: "Limpe o alojamento do cubo antes de posicionar o rolamento. Remova resíduos de graxa antiga e partículas metálicas." },
      { titulo: "Posicionamento", texto: "Posicione o rolamento perpendicular ao eixo, sem inclinação, alinhando as pistas interna e externa." },
      { titulo: "Prensagem", texto: "Utilize a prensa hidráulica para assentar o rolamento até o batente, aplicando força de forma uniforme e gradual." },
      { titulo: "Conferência final", texto: "Confirme o giro livre, sem folga ou ponto duro. Gire o cubo manualmente em ambos os sentidos." }
    ],
    cuidadosInstalacao: ["Nunca golpeie diretamente o anel externo do rolamento.", "Verifique a temperatura ambiente antes de usar graxa muito viscosa."],
    errosComunsInstalacao: ["Prensar o rolamento pela pista errada, gerando dano interno.", "Não limpar o alojamento, deixando partículas que causam desalinhamento."],
    lubrificacao: { tipo: "Graxa à base de lítio EP2", intervalo: "A cada 40.000 km", quantidade: "18 g por rolamento", procedimento: "Aplique a graxa preenchendo aproximadamente 2/3 do espaço interno das carreiras, evitando excesso na cavidade do cubo.", cuidados: ["Não misturar graxas de bases químicas diferentes.", "Evitar contaminação com água durante a lavagem do veículo."], errosComuns: ["Excesso de graxa, causando superaquecimento.", "Uso de graxa fora da especificação, reduzindo a vida útil."] },
    ferramentas: ["ferr-extrator", "ferr-torque", "ferr-prensa"],
    problemas: ["prob-aquecimento", "prob-ruido-cubo"],
    manualId: "man-frs1001"
  },
  {
    id: 2,
    partNumber: "FRS-1002",
    nome: "Rolamento de Câmbio",
    categoria: "Rolamento de Transmissão",
    aplicacoes: [
      { veiculo: "Mercedes-Benz Actros", modelo: "Actros 2651" },
      { veiculo: "DAF XF", modelo: "XF 480" }
    ],
    imagem: "Rolamento cilíndrico de esferas, com anel de vedação",
    videos: [{ titulo: "Instalação do FRS-1002", duracao: "3:02", tipo: "instalacao" }],
    passos: [
      { titulo: "Alinhamento do eixo", texto: "Verifique o alinhamento do eixo de entrada antes da montagem." },
      { titulo: "Aquecimento (se indicado)", texto: "Aqueça levemente o rolamento para facilitar o encaixe, se indicado no manual do fabricante." },
      { titulo: "Montagem", texto: "Posicione com o martelo de nylon, batendo de forma uniforme ao redor do anel." },
      { titulo: "Verificação da vedação", texto: "Cheque a vedação após a montagem, garantindo que não haja folga entre o anel e o alojamento." }
    ],
    cuidadosInstalacao: ["Não exceder 120°C ao aquecer o rolamento.", "Usar EPI adequado ao manusear peças aquecidas."],
    errosComunsInstalacao: ["Bater diretamente com martelo de aço, deformando a pista.", "Não verificar o alinhamento antes de montar."],
    lubrificacao: { tipo: "Óleo de transmissão SAE 75W-90", intervalo: "Conforme troca de óleo da transmissão", quantidade: "Imerso no óleo do câmbio", procedimento: "O rolamento é lubrificado pelo próprio óleo do câmbio; não há aplicação manual de graxa.", cuidados: ["Verificar sempre o nível de óleo após a troca."], errosComuns: ["Nível de óleo abaixo do especificado.", "Uso de óleo com viscosidade incorreta."] },
    ferramentas: ["ferr-extrator", "ferr-martelo"],
    problemas: ["prob-vibracao", "prob-desgaste-oleo"],
    manualId: "man-frs1002"
  },
  {
    id: 3,
    partNumber: "FRS-1003",
    nome: "Rolamento de Diferencial",
    categoria: "Rolamento de Eixo",
    aplicacoes: [
      { veiculo: "Iveco S-Way", modelo: "S-Way 460" },
      { veiculo: "Scania R450", modelo: "R450 Highline" }
    ],
    imagem: "Rolamento cônico reforçado, com porca de fixação",
    videos: [{ titulo: "Instalação do FRS-1003", duracao: "2:47", tipo: "instalacao" }],
    passos: [
      { titulo: "Limpeza do alojamento", texto: "Remova resíduos de graxa antiga do alojamento do diferencial." },
      { titulo: "Posicionamento", texto: "Posicione o rolamento com auxílio da prensa, sem forçar lateralmente." },
      { titulo: "Torque da porca", texto: "Aplique o torque especificado na porca de fixação, seguindo a sequência do manual." },
      { titulo: "Folga do pinhão", texto: "Verifique a folga do pinhão após a montagem, com relógio comparador." }
    ],
    cuidadosInstalacao: ["Seguir rigorosamente a sequência de torque.", "Não reutilizar a porca de fixação deformada."],
    errosComunsInstalacao: ["Forçar o rolamento lateralmente durante a prensagem.", "Não conferir a folga do pinhão após a montagem."],
    lubrificacao: { tipo: "Óleo para diferencial SAE 85W-140", intervalo: "A cada 80.000 km", quantidade: "Conforme nível do cárter", procedimento: "Completar o óleo pelo bujão de nível até o transbordamento leve, sinal de nível correto.", cuidados: ["Verificar vazamentos nos retentores antes de completar."], errosComuns: ["Nível de óleo abaixo do especificado.", "Folga incorreta entre coroa e pinhão."] },
    ferramentas: ["ferr-torque", "ferr-prensa"],
    problemas: ["prob-ruido-diferencial", "prob-lubrificacao-inadequada"],
    manualId: "man-frs1003"
  },
  {
    id: 4,
    partNumber: "FRS-1004",
    nome: "Rolamento de Suspensão",
    categoria: "Rolamento de Suspensão",
    aplicacoes: [
      { veiculo: "Volvo FH 540", modelo: "FH 540 6x2" },
      { veiculo: "DAF XF", modelo: "XF 480" }
    ],
    imagem: "Rolamento de agulhas com anel de retenção",
    videos: [{ titulo: "Instalação do FRS-1004", duracao: "1:58", tipo: "instalacao" }],
    passos: [
      { titulo: "Remoção do anel antigo", texto: "Retire o anel de retenção antigo com o alicate apropriado." },
      { titulo: "Posicionamento", texto: "Posicione o novo rolamento alinhado ao braço de suspensão." },
      { titulo: "Novo anel de retenção", texto: "Instale o anel de retenção novo, confirmando o encaixe completo no rasgo." },
      { titulo: "Checagem de folga", texto: "Movimente o braço manualmente para checar folga residual." }
    ],
    cuidadosInstalacao: ["Sempre substituir o anel de retenção, nunca reaproveitar.", "Lixar rebarbas do alojamento antes de montar."],
    errosComunsInstalacao: ["Reutilizar anel de retenção deformado.", "Não alinhar corretamente o braço de suspensão."],
    lubrificacao: { tipo: "Graxa à base de lítio EP2", intervalo: "A cada 30.000 km", quantidade: "12 g por rolamento", procedimento: "Aplicar a graxa nas agulhas antes da montagem e reforçar pelo ponto de lubrificação após instalado.", cuidados: ["Evitar excesso, que pode danificar a vedação."], errosComuns: ["Alinhamento incorreto da suspensão.", "Falta de graxa nas agulhas antes da montagem."] },
    ferramentas: ["ferr-alicate-anel", "ferr-extrator"],
    problemas: ["prob-dificuldade-instalacao", "prob-desgaste-suspensao"],
    manualId: "man-frs1004"
  },
  {
    id: 5,
    partNumber: "FRS-1005",
    nome: "Rolamento de Eixo Comando",
    categoria: "Rolamento de Motor",
    aplicacoes: [
      { veiculo: "Mercedes-Benz Actros", modelo: "Actros 2651" },
      { veiculo: "Iveco S-Way", modelo: "S-Way 460" }
    ],
    imagem: "Rolamento de esferas de precisão, baixo atrito",
    videos: [{ titulo: "Instalação do FRS-1005", duracao: "2:30", tipo: "instalacao" }],
    passos: [
      { titulo: "Verificação do eixo comando", texto: "Inspecione o eixo comando quanto a riscos ou desgaste antes de instalar o rolamento." },
      { titulo: "Posicionamento", texto: "Posicione o rolamento com a prensa manual, apoiando somente o anel interno." },
      { titulo: "Fixação", texto: "Instale o anel de trava e confirme o assentamento completo." },
      { titulo: "Teste de giro", texto: "Gire o eixo manualmente, checando ausência de travamento ou ruído." }
    ],
    cuidadosInstalacao: ["Apoiar somente o anel interno ao prensar.", "Manter o ambiente livre de poeira durante a montagem."],
    errosComunsInstalacao: ["Apoiar o anel externo ao prensar, danificando as esferas.", "Montar com o eixo sujo ou riscado."],
    lubrificacao: { tipo: "Óleo do motor conforme especificação do fabricante", intervalo: "Conforme troca de óleo do motor", quantidade: "Imerso no óleo do motor", procedimento: "Lubrificado pela circulação do óleo do motor; não há aplicação manual.", cuidados: ["Usar somente óleo homologado para o motor."], errosComuns: ["Uso de óleo fora da especificação.", "Troca de óleo atrasada."] },
    ferramentas: ["ferr-prensa-manual", "ferr-alicate-anel"],
    problemas: ["prob-ruido-motor", "prob-dificuldade-instalacao"],
    manualId: "man-frs1005"
  }
];

/* ---------- Ferramentas (catálogo reutilizável) ---------- */
const FERRAMENTAS = [
  { id: "ferr-extrator", nome: "Extrator de rolamento", descricao: "Ferramenta usada para remover rolamentos prensados sem danificar o eixo ou o alojamento.", uso: "Remoção", procedimento: "Posicione as garras atrás da pista interna e acione o fuso lentamente até soltar o rolamento." },
  { id: "ferr-torque", nome: "Torquímetro", descricao: "Aplica o torque exato especificado no manual, evitando aperto excessivo ou insuficiente.", uso: "Fixação", procedimento: "Ajuste o valor de torque especificado e aperte em sequência cruzada quando houver mais de um ponto." },
  { id: "ferr-prensa", nome: "Prensa hidráulica", descricao: "Utilizada para assentar rolamentos de forma uniforme, sem impacto.", uso: "Montagem", procedimento: "Apoie a peça corretamente e aplique força de forma gradual até o batente." },
  { id: "ferr-martelo", nome: "Martelo de nylon", descricao: "Usado para pequenos ajustes de montagem sem marcar a peça.", uso: "Montagem", procedimento: "Aplique golpes leves e uniformes ao redor do anel, nunca em um único ponto." },
  { id: "ferr-alicate-anel", nome: "Alicate de anel de retenção", descricao: "Remove e instala anéis de retenção (anéis elásticos) sem deformá-los.", uso: "Remoção e montagem", procedimento: "Encaixe as pontas do alicate nos furos do anel e comprima até liberar o encaixe." },
  { id: "ferr-prensa-manual", nome: "Prensa manual de bancada", descricao: "Alternativa à prensa hidráulica para peças menores.", uso: "Montagem", procedimento: "Centralize a peça na base e acione a alavanca de forma gradual." }
];
const FERRAMENTAS_POR_ID = Object.fromEntries(FERRAMENTAS.map(f => [f.id, f]));

/* ---------- Problemas comuns (catálogo) ---------- */
const PROBLEMAS = [
  { id: "prob-aquecimento", titulo: "Aquecimento", causas: "Lubrificação insuficiente ou pré-carga incorreta no aperto do cubo.", verificar: ["Quantidade de graxa aplicada", "Torque de aperto do cubo", "Temperatura após rodagem curta"], solucao: "Verifique a quantidade de graxa e reaperte conforme o torque especificado no manual.", quandoTecnico: "Se o aquecimento persistir após reaperto e relubrificação corretos." },
  { id: "prob-ruido-cubo", titulo: "Ruído no cubo de roda", causas: "Contaminação por sujeira durante a instalação ou desgaste das pistas.", verificar: ["Marcas visuais nas pistas", "Folga axial do rolamento", "Presença de partículas na graxa"], solucao: "Inspecione visualmente as pistas; se houver marcas, substitua o rolamento.", quandoTecnico: "Ruído metálico constante mesmo após substituição." },
  { id: "prob-vibracao", titulo: "Vibração", causas: "Desalinhamento do eixo ou folga excessiva de montagem.", verificar: ["Alinhamento do eixo de entrada", "Folga axial recomendada", "Fixação dos parafusos"], solucao: "Refaça o alinhamento e verifique a folga axial recomendada.", quandoTecnico: "Vibração que aumenta progressivamente com o uso." },
  { id: "prob-desgaste-oleo", titulo: "Desgaste irregular por óleo", causas: "Contaminação do óleo ou nível abaixo do recomendado.", verificar: ["Nível de óleo", "Cor e viscosidade do óleo", "Presença de limalha no bujão magnético"], solucao: "Troque o óleo e verifique o nível conforme especificação.", quandoTecnico: "Limalha metálica visível no óleo trocado." },
  { id: "prob-ruido-diferencial", titulo: "Ruído no diferencial", causas: "Folga incorreta entre coroa e pinhão.", verificar: ["Folga do pinhão com relógio comparador", "Marcas de contato na coroa"], solucao: "Reajuste a folga seguindo a sequência de torque do manual.", quandoTecnico: "Ruído em aceleração e desaceleração ao mesmo tempo." },
  { id: "prob-lubrificacao-inadequada", titulo: "Lubrificação inadequada", causas: "Nível de óleo abaixo do especificado.", verificar: ["Nível pelo bujão", "Vazamento nos retentores"], solucao: "Complete o óleo até o nível correto e verifique vazamentos nos retentores.", quandoTecnico: "Vazamento constante mesmo após troca do retentor." },
  { id: "prob-dificuldade-instalacao", titulo: "Dificuldade de instalação", causas: "Anel de retenção antigo deformado ou alojamento com rebarbas.", verificar: ["Estado do anel de retenção", "Rebarbas no alojamento"], solucao: "Substitua o anel de retenção e lixe rebarbas do alojamento antes de montar.", quandoTecnico: "Peça nova não assenta mesmo após os ajustes." },
  { id: "prob-desgaste-suspensao", titulo: "Desgaste irregular na suspensão", causas: "Alinhamento incorreto da suspensão.", verificar: ["Geometria da suspensão", "Desgaste de buchas próximas"], solucao: "Verifique a geometria da suspensão em bancada especializada.", quandoTecnico: "Desgaste reaparece em poucos milhares de km." },
  { id: "prob-ruido-motor", titulo: "Ruído no eixo comando", causas: "Montagem com apoio incorreto ou eixo riscado.", verificar: ["Estado do eixo comando", "Pressão de óleo do motor"], solucao: "Inspecione o eixo quanto a riscos; se houver dano, o eixo também deve ser avaliado.", quandoTecnico: "Ruído acompanhado de queda de pressão de óleo." }
];
const PROBLEMAS_POR_ID = Object.fromEntries(PROBLEMAS.map(p => [p.id, p]));

/* ---------- Manuais (documentos fictícios, simulam o SharePoint) ---------- */
const MANUAIS = {
  "man-frs1001": {
    id: "man-frs1001", titulo: "Manual FRS-1001 — Rolamento de Roda Dianteira", versao: "v2.1", atualizadoEm: "12/08/2026", origem: "SharePoint (simulado)",
    secoes: [
      { id: "visao-geral", titulo: "Visão geral", texto: "O FRS-1001 é um rolamento cônico de duas carreiras, projetado para cubos de roda dianteira de veículos pesados. Este manual cobre instalação, lubrificação e diagnóstico de problemas comuns." },
      { id: "instalacao", titulo: "Procedimento de instalação", texto: "Siga rigorosamente a sequência abaixo para evitar dano prematuro ao rolamento.", lista: ["Limpe o alojamento do cubo.", "Posicione o rolamento perpendicular ao eixo.", "Use a prensa hidráulica até o batente.", "Confirme o giro livre, sem folga ou ponto duro."] },
      { id: "lubrificacao", titulo: "Lubrificação", texto: "Utilize graxa à base de lítio EP2, aplicando 18 g por rolamento a cada 40.000 km." },
      { id: "torque", titulo: "Torques de referência", texto: "Consulte a tabela de torque do fabricante do veículo para a porca do cubo. Valores variam por aplicação." },
      { id: "problemas", titulo: "Diagnóstico de problemas", texto: "Os problemas mais comuns são aquecimento e ruído.", lista: ["Aquecimento: verifique graxa e pré-carga do aperto.", "Ruído: inspecione as pistas quanto a marcas de desgaste."] }
    ]
  },
  "man-frs1002": { id: "man-frs1002", titulo: "Manual FRS-1002 — Rolamento de Câmbio", versao: "v1.4", atualizadoEm: "03/07/2026", origem: "SharePoint (simulado)",
    secoes: [
      { id: "visao-geral", titulo: "Visão geral", texto: "O FRS-1002 é lubrificado pelo próprio óleo da transmissão e exige atenção ao alinhamento do eixo de entrada." },
      { id: "instalacao", titulo: "Procedimento de instalação", texto: "", lista: ["Verifique o alinhamento do eixo de entrada.", "Aqueça levemente o rolamento, se indicado.", "Posicione com martelo de nylon.", "Cheque a vedação após a montagem."] },
      { id: "lubrificacao", titulo: "Lubrificação", texto: "Óleo de transmissão SAE 75W-90, conforme intervalo de troca da transmissão." },
      { id: "problemas", titulo: "Diagnóstico de problemas", texto: "", lista: ["Vibração: desalinhamento ou folga excessiva.", "Desgaste irregular: contaminação ou nível baixo de óleo."] }
    ] },
  "man-frs1003": { id: "man-frs1003", titulo: "Manual FRS-1003 — Rolamento de Diferencial", versao: "v1.2", atualizadoEm: "20/05/2026", origem: "SharePoint (simulado)",
    secoes: [
      { id: "visao-geral", titulo: "Visão geral", texto: "O FRS-1003 exige controle rigoroso da folga entre coroa e pinhão para funcionamento silencioso." },
      { id: "instalacao", titulo: "Procedimento de instalação", texto: "", lista: ["Remova resíduos de graxa antiga.", "Posicione com a prensa, sem forçar lateralmente.", "Aplique o torque especificado na porca.", "Verifique a folga do pinhão."] },
      { id: "lubrificacao", titulo: "Lubrificação", texto: "Óleo para diferencial SAE 85W-140, a cada 80.000 km." },
      { id: "problemas", titulo: "Diagnóstico de problemas", texto: "", lista: ["Ruído: folga incorreta entre coroa e pinhão.", "Lubrificação inadequada: nível de óleo baixo."] }
    ] },
  "man-frs1004": { id: "man-frs1004", titulo: "Manual FRS-1004 — Rolamento de Suspensão", versao: "v1.0", atualizadoEm: "02/03/2026", origem: "SharePoint (simulado)",
    secoes: [
      { id: "visao-geral", titulo: "Visão geral", texto: "O FRS-1004 utiliza anel de retenção, que deve sempre ser substituído na troca do rolamento." },
      { id: "instalacao", titulo: "Procedimento de instalação", texto: "", lista: ["Retire o anel de retenção antigo.", "Posicione o novo rolamento alinhado.", "Instale o anel de retenção novo.", "Movimente o braço para checar folga."] },
      { id: "lubrificacao", titulo: "Lubrificação", texto: "Graxa à base de lítio EP2, 12 g por rolamento, a cada 30.000 km." },
      { id: "problemas", titulo: "Diagnóstico de problemas", texto: "", lista: ["Dificuldade de instalação: anel deformado ou rebarbas no alojamento.", "Desgaste irregular: alinhamento incorreto da suspensão."] }
    ] },
  "man-frs1005": { id: "man-frs1005", titulo: "Manual FRS-1005 — Rolamento de Eixo Comando", versao: "v1.0", atualizadoEm: "15/02/2026", origem: "SharePoint (simulado)",
    secoes: [
      { id: "visao-geral", titulo: "Visão geral", texto: "O FRS-1005 é um rolamento de precisão; o apoio incorreto durante a prensagem é a principal causa de dano." },
      { id: "instalacao", titulo: "Procedimento de instalação", texto: "", lista: ["Inspecione o eixo comando quanto a riscos.", "Apoie somente o anel interno ao prensar.", "Instale o anel de trava.", "Teste o giro manualmente."] },
      { id: "lubrificacao", titulo: "Lubrificação", texto: "Lubrificado pela circulação do óleo do motor; sem aplicação manual." },
      { id: "problemas", titulo: "Diagnóstico de problemas", texto: "", lista: ["Ruído: montagem com apoio incorreto ou eixo riscado."] }
    ] }
};

/* =====================================================================
   Base de conhecimento (documentos indexáveis) — representação visual
   do que futuramente alimentará o RAG. Nenhum embedding real é gerado.
   ===================================================================== */
const BASE_CONHECIMENTO = [
  { id: "doc-1", titulo: "Manual FRS-1001 — Rolamento de Roda Dianteira", tipo: "Manual", pecaId: 1, origem: "CMS", status: "INDEXADO", chunks: 18, atualizadoEm: "12/08/2026" },
  { id: "doc-2", titulo: "Manual FRS-1002 — Rolamento de Câmbio", tipo: "Manual", pecaId: 2, origem: "CMS", status: "INDEXADO", chunks: 14, atualizadoEm: "03/07/2026" },
  { id: "doc-3", titulo: "Manual FRS-1003 — Rolamento de Diferencial", tipo: "Manual", pecaId: 3, origem: "CMS", status: "INDEXADO", chunks: 13, atualizadoEm: "20/05/2026" },
  { id: "doc-4", titulo: "Manual FRS-1004 — Rolamento de Suspensão", tipo: "Manual", pecaId: 4, origem: "CMS", status: "INDEXADO", chunks: 12, atualizadoEm: "02/03/2026" },
  { id: "doc-5", titulo: "Manual FRS-1005 — Rolamento de Eixo Comando", tipo: "Manual", pecaId: 5, origem: "CMS", status: "DESATUALIZADO", chunks: 9, atualizadoEm: "15/02/2026" },
  { id: "doc-6", titulo: "Problemas comuns — Aquecimento (FRS-1001)", tipo: "Problema", pecaId: 1, origem: "CMS", status: "INDEXADO", chunks: 1, atualizadoEm: "12/08/2026" },
  { id: "doc-7", titulo: "Tutorial de lubrificação — linha de cubo", tipo: "Tutorial", pecaId: null, origem: "CMS", status: "PROCESSANDO", chunks: 0, atualizadoEm: "20/09/2026" },
  { id: "doc-8", titulo: "Procedimento — torque de porcas de diferencial", tipo: "Procedimento", pecaId: 3, origem: "SharePoint (simulado)", status: "ERRO", chunks: 0, atualizadoEm: "18/09/2026", erro: "Falha ao extrair texto do documento de origem." },
  { id: "doc-9", titulo: "Rascunho — comparativo de graxas EP2 x EP1", tipo: "Procedimento", pecaId: null, origem: "CMS", status: "RASCUNHO", chunks: 0, atualizadoEm: "21/09/2026" }
];

/* ---------- Base de perguntas e respostas simuladas (mock da IA) ---------- */
const IA_BASE = [
  {
    palavrasChave: ["aquec", "quente", "esquentando", "esquenta"],
    pecaId: 1,
    resposta: "O aquecimento do FRS-1001 costuma estar relacionado à lubrificação insuficiente ou à pré-carga incorreta no aperto do cubo. Verifique a quantidade de graxa aplicada (recomendado: 18 g) e confira se o torque de aperto do cubo segue o valor especificado. Depois do reaperto, rode o veículo por um trecho curto e meça a temperatura novamente antes de liberar o veículo.",
    fontes: [
      { documento: "Manual FRS-1001 — Rolamento de Roda Dianteira", secao: "Diagnóstico de problemas", trecho: "Aquecimento: verifique graxa e pré-carga do aperto.", pecaId: 1, tipo: "manual", refId: "man-frs1001", refAncora: "problemas" },
      { documento: "Problemas comuns — Aquecimento (FRS-1001)", secao: "Causas prováveis", trecho: "Lubrificação insuficiente ou pré-carga incorreta no aperto do cubo.", pecaId: 1, tipo: "problema", refId: "prob-aquecimento" }
    ]
  },
  {
    palavrasChave: ["instalar", "instalação", "montar", "montagem"],
    pecaId: 1,
    resposta: "Para instalar o FRS-1001: limpe bem o alojamento do cubo, posicione o rolamento perpendicular ao eixo (sem inclinação), use a prensa hidráulica para assentar até o batente e, por fim, confirme o giro livre em ambos os sentidos, sem folga ou ponto duro.",
    fontes: [
      { documento: "Manual FRS-1001 — Rolamento de Roda Dianteira", secao: "Procedimento de instalação", trecho: "Posicione o rolamento perpendicular ao eixo. Use a prensa hidráulica até o batente.", pecaId: 1, tipo: "manual", refId: "man-frs1001", refAncora: "instalacao" }
    ]
  },
  {
    palavrasChave: ["ferramenta", "ferramentas"],
    pecaId: null,
    resposta: "As ferramentas variam conforme a peça, mas as mais usadas na linha de rolamentos são o extrator de rolamento (para remoção), a prensa hidráulica ou manual (para montagem) e o torquímetro (para fixação no valor especificado). Informe o Part Number da peça para eu indicar a lista exata.",
    fontes: [
      { documento: "Catálogo de ferramentas", secao: "Extrator de rolamento", trecho: "Ferramenta usada para remover rolamentos prensados sem danificar o eixo ou o alojamento.", pecaId: null, tipo: "ferramenta", refId: "ferr-extrator" }
    ]
  },
  {
    palavrasChave: ["lubrific", "graxa", "óleo", "oleo"],
    pecaId: 1,
    resposta: "O FRS-1001 usa graxa à base de lítio EP2, na quantidade de 18 g por rolamento, reaplicada a cada 40.000 km. Preencha aproximadamente 2/3 do espaço interno das carreiras — o excesso de graxa é uma das causas mais comuns de superaquecimento.",
    fontes: [
      { documento: "Manual FRS-1001 — Rolamento de Roda Dianteira", secao: "Lubrificação", trecho: "Utilize graxa à base de lítio EP2, aplicando 18 g por rolamento a cada 40.000 km.", pecaId: 1, tipo: "manual", refId: "man-frs1001", refAncora: "lubrificacao" }
    ]
  },
  {
    palavrasChave: ["ruído", "ruido", "barulho"],
    pecaId: 3,
    resposta: "Ruído no diferencial geralmente indica folga incorreta entre coroa e pinhão. Reajuste a folga seguindo a sequência de torque do manual e verifique as marcas de contato na coroa com azul de prova.",
    fontes: [
      { documento: "Manual FRS-1003 — Rolamento de Diferencial", secao: "Diagnóstico de problemas", trecho: "Ruído: folga incorreta entre coroa e pinhão.", pecaId: 3, tipo: "manual", refId: "man-frs1003", refAncora: "problemas" }
    ]
  },
  {
    palavrasChave: ["vibra", "trepida"],
    pecaId: 2,
    resposta: "Vibração no FRS-1002 costuma vir de desalinhamento do eixo de entrada ou folga excessiva de montagem. Refaça o alinhamento e confira a folga axial recomendada antes de liberar o veículo.",
    fontes: [
      { documento: "Manual FRS-1002 — Rolamento de Câmbio", secao: "Diagnóstico de problemas", trecho: "Vibração: desalinhamento ou folga excessiva.", pecaId: 2, tipo: "manual", refId: "man-frs1002", refAncora: "problemas" }
    ]
  }
];

/* ---------- Chamados (mock, gerados/consultados via api.js) ---------- */
let SEQ_CHAMADO = 1032;
const CHAMADOS = [
  {
    id: 1030, protocolo: "FC-2026-1030", status: "RESOLVIDO", prioridade: "MEDIA",
    assunto: "Rolamento FRS-1001 aquecendo após instalação", descricao: "Instalei o rolamento seguindo o passo a passo, mas depois de 20 km de rodagem o cubo está esquentando bastante.",
    partNumber: "FRS-1001", pecaId: 1, aplicacao: "Volvo FH 540", solicitante: "Carlos Mendes", origemIA: true,
    abertoEm: "14/09/2026 09:12", atualizadoEm: "14/09/2026 15:40",
    historico: [
      { data: "14/09/2026 09:12", texto: "Chamado aberto pelo mecânico a partir da Busca por IA." },
      { data: "14/09/2026 11:05", texto: "Técnico Renata Souza assumiu o chamado." },
      { data: "14/09/2026 15:40", texto: "Solução registrada: pré-carga do cubo estava acima do especificado. Reaperto conforme torque do manual resolveu o aquecimento." }
    ],
    solucaoTecnico: "Pré-carga do cubo estava acima do especificado. Reaperto conforme torque do manual resolveu o aquecimento."
  },
  {
    id: 1031, protocolo: "FC-2026-1031", status: "EM_ATENDIMENTO", prioridade: "ALTA",
    assunto: "Dificuldade para encaixar anel de retenção do FRS-1004", descricao: "O anel de retenção novo não está encaixando completamente no rasgo do alojamento.",
    partNumber: "FRS-1004", pecaId: 4, aplicacao: "DAF XF", solicitante: "Carlos Mendes", origemIA: false,
    abertoEm: "20/09/2026 08:30", atualizadoEm: "20/09/2026 10:00",
    historico: [
      { data: "20/09/2026 08:30", texto: "Chamado aberto pelo mecânico." },
      { data: "20/09/2026 10:00", texto: "Técnico Renata Souza assumiu o chamado e solicitou fotos do alojamento." }
    ],
    solucaoTecnico: null
  }
];

/* ---------- Utilitário: escapar texto antes de inserir no HTML ---------- */
function esc(valor){
  return String(valor ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
