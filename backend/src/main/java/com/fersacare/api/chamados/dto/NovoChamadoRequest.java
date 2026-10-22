package com.fersacare.api.chamados.dto;

import com.fersacare.api.chamados.model.PrioridadeChamado;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record NovoChamadoRequest(
    @NotBlank(message = "o assunto é obrigatório") String assunto,
    @NotBlank(message = "a descrição é obrigatória") String descricao,
    UUID pecaId,                  // opcional — chamado pode não estar ligado a uma peça
    String aplicacaoTexto,        // opcional — preenchido pelo frontend a partir da peça escolhida
    PrioridadeChamado prioridade  // opcional — padrão MEDIA, ver ChamadoService
) {}
