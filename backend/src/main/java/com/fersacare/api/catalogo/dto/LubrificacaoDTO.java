package com.fersacare.api.catalogo.dto;

import java.util.List;

public record LubrificacaoDTO(
    String tipo,
    String intervalo,
    String quantidade,
    String procedimento,
    List<String> cuidados,
    List<String> errosComuns
) {}
