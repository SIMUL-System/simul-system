package com.simulsystem.backend.business.usuario.dto;

public record RecuperacaoSenhaResponseDTO(
        boolean sucesso,
        String mensagem
) {
}