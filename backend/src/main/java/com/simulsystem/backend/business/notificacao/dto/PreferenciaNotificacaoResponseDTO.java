package com.simulsystem.backend.business.notificacao.dto;

import java.time.LocalDateTime;

public record PreferenciaNotificacaoResponseDTO(
        Long id,
        Long usuarioId,
        Boolean emailAtivo,
        Integer antecedenciaHoras,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao
) {
}