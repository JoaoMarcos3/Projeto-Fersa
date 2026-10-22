package com.fersacare.api.chamados.service;

import com.fersacare.api.chamados.model.StatusChamado;
import com.fersacare.api.chamados.dto.ChamadoDTO;
import com.fersacare.api.chamados.dto.HistoricoItemDTO;
import com.fersacare.api.chamados.dto.NovoChamadoRequest;
import com.fersacare.api.chamados.dto.RegistrarSolucaoRequest;
import com.fersacare.api.chamados.repository.ChamadoHistoricoRepository;
import com.fersacare.api.chamados.repository.ChamadoRepository;
import com.fersacare.api.common.RecursoNaoEncontradoException;
import com.fersacare.api.common.RequisicaoInvalidaException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ChamadoService {

    private final ChamadoRepository chamadoRepository;
    private final ChamadoHistoricoRepository historicoRepository;

    public ChamadoService(ChamadoRepository chamadoRepository, ChamadoHistoricoRepository historicoRepository) {
        this.chamadoRepository = chamadoRepository;
        this.historicoRepository = historicoRepository;
    }

    public ChamadoDTO abrir(NovoChamadoRequest req, UUID solicitanteId) {
        ChamadoDTO criado = chamadoRepository.inserir(req, solicitanteId);
        historicoRepository.registrar(criado.id(), solicitanteId, "Chamado aberto pelo mecânico.");
        return comHistorico(criado);
    }

    /**
     * Mecânico/cliente só enxergam os próprios chamados; técnico/admin
     * enxergam todos. Essa decisão já vem pronta do Controller (que lê
     * as authorities do token) para o Service não depender de tipos do
     * Spring Security — ele só recebe "pode ver tudo ou não".
     */
    public List<ChamadoDTO> listar(UUID usuarioId, boolean podeVerTodos) {
        List<ChamadoDTO> chamados = podeVerTodos
            ? chamadoRepository.listarTodos()
            : chamadoRepository.listarPorSolicitante(usuarioId);
        return chamados.stream().map(this::comHistorico).toList();
    }

    public ChamadoDTO buscarDetalhe(UUID id, UUID usuarioId, boolean podeVerTodos) {
        ChamadoDTO chamado = chamadoRepository.buscarPorId(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Chamado não encontrado: " + id));

        // 404 em vez de 403 de propósito: um mecânico não deve nem saber
        // que o protocolo de outra pessoa existe.
        if (!podeVerTodos && !chamado.solicitanteId().equals(usuarioId)) {
            throw new RecursoNaoEncontradoException("Chamado não encontrado: " + id);
        }
        return comHistorico(chamado);
    }

    public ChamadoDTO assumir(UUID chamadoId, UUID tecnicoId) {
        ChamadoDTO chamado = chamadoRepository.buscarPorId(chamadoId)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Chamado não encontrado: " + chamadoId));
        if (chamado.status() != StatusChamado.ABERTO) {
            throw new RequisicaoInvalidaException("Só é possível assumir um chamado com status ABERTO (atual: " + chamado.status() + ").");
        }
        chamadoRepository.assumir(chamadoId, tecnicoId);
        historicoRepository.registrar(chamadoId, tecnicoId, "Técnico assumiu o chamado.");
        return comHistorico(chamadoRepository.buscarPorId(chamadoId).orElseThrow());
    }

    public ChamadoDTO registrarSolucao(UUID chamadoId, RegistrarSolucaoRequest req, UUID tecnicoId) {
        ChamadoDTO chamado = chamadoRepository.buscarPorId(chamadoId)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Chamado não encontrado: " + chamadoId));
        if (chamado.status() != StatusChamado.EM_ATENDIMENTO) {
            throw new RequisicaoInvalidaException("Só é possível registrar solução para um chamado EM_ATENDIMENTO (atual: " + chamado.status() + ").");
        }
        chamadoRepository.registrarSolucao(chamadoId, req.solucao());
        historicoRepository.registrar(chamadoId, tecnicoId, "Solução registrada: " + req.solucao());
        return comHistorico(chamadoRepository.buscarPorId(chamadoId).orElseThrow());
    }

    private ChamadoDTO comHistorico(ChamadoDTO chamado) {
        List<HistoricoItemDTO> historico = historicoRepository.listarPorChamado(chamado.id());
        return new ChamadoDTO(
            chamado.id(), chamado.numero(), chamado.protocolo(), chamado.status(), chamado.prioridade(),
            chamado.assunto(), chamado.descricao(), chamado.pecaId(), chamado.partNumber(), chamado.aplicacaoTexto(),
            chamado.solicitanteId(), chamado.solicitanteNome(), chamado.tecnicoId(), chamado.tecnicoNome(),
            chamado.origemIa(), chamado.solucaoTecnico(), chamado.criadoEm(), chamado.atualizadoEm(), historico
        );
    }
}
