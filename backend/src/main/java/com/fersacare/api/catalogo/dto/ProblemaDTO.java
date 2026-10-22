package com.fersacare.api.catalogo.dto;

import java.util.List;
import java.util.UUID;

public record ProblemaDTO(
    UUID id,
    String titulo,
    String causas,
    List<String> verificar,
    String solucao,
    String quandoTecnico
) {}
