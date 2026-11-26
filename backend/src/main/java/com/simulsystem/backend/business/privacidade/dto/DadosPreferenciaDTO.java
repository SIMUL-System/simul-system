package com.simulsystem.backend.business.privacidade.dto;

import java.time.LocalDateTime;

/** Preferência de lembrete na cópia dos dados. */
public record DadosPreferenciaDTO(
        String cidade,
        String bairro,
        String rota,
        Boolean lembretePorEmail,
        Boolean lembreteNoNavegador,
        Integer antecedenciaHoras,
        LocalDateTime atualizadaEm
) {
}
