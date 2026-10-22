package com.fersacare.api.chamados.dto;

import com.fersacare.api.chamados.model.PrioridadeChamado;
import com.fersacare.api.chamados.model.StatusChamado;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ChamadoDTO(
    UUID id,
    long numero,
    String protocolo,
    StatusChamado status,
    PrioridadeChamado prioridade,
    String assunto,
    String descricao,
    UUID pecaId,
    String partNumber,          // nulo se o chamado não está ligado a uma peça
    String aplicacaoTexto,
    UUID solicitanteId,
    String solicitanteNome,
    UUID tecnicoId,
    String tecnicoNome,         // nulo enquanto ninguém assumiu
    boolean origemIa,
    String solucaoTecnico,      // nulo até o status virar RESOLVIDO
    Instant criadoEm,
    Instant atualizadoEm,
    List<HistoricoItemDTO> historico
) {}
