package com.simulsystem.backend.business.privacidade.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Cópia dos dados pessoais que o SIMUL guarda sobre o usuário
 * (direito de acesso e portabilidade da LGPD, art. 18).
 */
public record MeusDadosResponseDTO(
        LocalDateTime geradoEm,
        DadosContaDTO conta,
        DadosPreferenciaDTO preferencia,
        List<LocalDateTime> navegadoresInscritosEm,
        List<DadosLembreteDTO> ultimosLembretes,
        String observacao
) {
}
