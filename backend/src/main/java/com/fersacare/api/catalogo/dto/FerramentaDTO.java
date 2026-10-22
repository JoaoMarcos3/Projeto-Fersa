package com.fersacare.api.catalogo.dto;

import java.util.UUID;

public record FerramentaDTO(
    UUID id,
    String nome,
    String descricao,
    String uso,
    String procedimento
) {}
