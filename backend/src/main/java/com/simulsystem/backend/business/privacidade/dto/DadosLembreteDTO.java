package com.simulsystem.backend.business.privacidade.dto;

import java.time.LocalDateTime;

/** Um lembrete do histórico, na cópia dos dados. */
public record DadosLembreteDTO(
        LocalDateTime coletaEm,
        String rota,
        String canal,
        String situacao,
        LocalDateTime enviadoEm
) {
}
