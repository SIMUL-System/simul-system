package com.simulsystem.backend.business.usuario.dto;

/** Resultado da confirmação de e-mail. */
public record VerificacaoEmailResponseDTO(boolean verificado, String mensagem) {
}
