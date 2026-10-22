package com.fersacare.api.common;

import java.time.Instant;
import java.util.List;

/** Formato único de erro devolvido pela API — ver arquitetura.md, seção Segurança. */
public record ApiError(
    Instant timestamp,
    int status,
    String erro,
    String mensagem,
    String caminho,
    List<String> detalhes
) {
    public static ApiError de(int status, String erro, String mensagem, String caminho) {
        return new ApiError(Instant.now(), status, erro, mensagem, caminho, null);
    }

    public static ApiError deValidacao(String caminho, List<String> detalhes) {
        return new ApiError(Instant.now(), 422, "Erro de validação", "Um ou mais campos são inválidos.", caminho, detalhes);
    }
}
