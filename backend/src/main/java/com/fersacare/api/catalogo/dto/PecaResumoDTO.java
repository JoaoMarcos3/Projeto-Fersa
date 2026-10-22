package com.fersacare.api.catalogo.dto;

import java.util.List;
import java.util.UUID;

public record PecaResumoDTO(
    UUID id,
    String partNumber,
    String nome,
    String categoria,
    List<AplicacaoDTO> aplicacoes
) {}
