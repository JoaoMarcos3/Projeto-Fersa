package com.fersacare.api.chamados.dto;

import jakarta.validation.constraints.NotBlank;

public record RegistrarSolucaoRequest(
    @NotBlank(message = "descreva a solução aplicada") String solucao
) {}
