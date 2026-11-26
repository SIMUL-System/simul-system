package com.simulsystem.backend.business.privacidade.dto;

import java.time.LocalDateTime;

/** Dados da conta na cópia que o usuário baixa. */
public record DadosContaDTO(
        String nome,
        String email,
        String perfil,
        Boolean emailConfirmado,
        LocalDateTime contaCriadaEm,
        String versaoDosTermosAceita,
        LocalDateTime termosAceitosEm
) {
}
