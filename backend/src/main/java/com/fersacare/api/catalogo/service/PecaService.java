package com.fersacare.api.catalogo.service;

import com.fersacare.api.catalogo.dto.*;
import com.fersacare.api.catalogo.repository.*;
import com.fersacare.api.common.RecursoNaoEncontradoException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PecaService {

    private final PecaRepository pecaRepository;
    private final AplicacaoRepository aplicacaoRepository;
    private final FerramentaRepository ferramentaRepository;
    private final ProblemaRepository problemaRepository;
    private final LubrificacaoRepository lubrificacaoRepository;
    private final TutorialPassoRepository tutorialPassoRepository;
    private final VideoRepository videoRepository;

    public PecaService(
        PecaRepository pecaRepository,
        AplicacaoRepository aplicacaoRepository,
        FerramentaRepository ferramentaRepository,
        ProblemaRepository problemaRepository,
        LubrificacaoRepository lubrificacaoRepository,
        TutorialPassoRepository tutorialPassoRepository,
        VideoRepository videoRepository
    ) {
        this.pecaRepository = pecaRepository;
        this.aplicacaoRepository = aplicacaoRepository;
        this.ferramentaRepository = ferramentaRepository;
        this.problemaRepository = problemaRepository;
        this.lubrificacaoRepository = lubrificacaoRepository;
        this.tutorialPassoRepository = tutorialPassoRepository;
        this.videoRepository = videoRepository;
    }

    /** Busca tradicional — ver PecaRepository para os 6 modos suportados. */
    public List<PecaResumoDTO> buscar(String termo, String modo) {
        return pecaRepository.buscarPorFiltro(termo, modo);
    }

    /** Monta a ficha completa, igual à tela /peca/:id do protótipo Web. */
    public PecaDetalheDTO buscarDetalhe(UUID id) {
        PecaResumoDTO resumo = pecaRepository.buscarResumoPorId(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Peça não encontrada: " + id));

        String imagem = pecaRepository.buscarImagemDescricao(id).orElse(null);
        List<FerramentaDTO> ferramentas = ferramentaRepository.buscarPorPeca(id);
        List<ProblemaDTO> problemas = problemaRepository.buscarPorPeca(id);
        LubrificacaoDTO lubrificacao = lubrificacaoRepository.buscarPorPeca(id).orElse(null);
        List<PassoDTO> passos = tutorialPassoRepository.buscarPorPeca(id);
        List<VideoDTO> videos = videoRepository.buscarPorPeca(id);

        return new PecaDetalheDTO(
            resumo.id(), resumo.partNumber(), resumo.nome(), resumo.categoria(), imagem,
            resumo.aplicacoes(), ferramentas, problemas, lubrificacao, passos, videos
        );
    }
}
