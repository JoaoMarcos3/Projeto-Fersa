package com.fersacare.api.common;

/** Regra de negócio violada (não confundir com @Valid, que o handler trata à parte). */
public class RequisicaoInvalidaException extends RuntimeException {
    public RequisicaoInvalidaException(String mensagem) {
        super(mensagem);
    }
}
