package com.simulsystem.backend.business.usuario.dto;

public record VerificacaoEmailResponseDTO(
        boolean verificado,
        String mensagem
) {
}