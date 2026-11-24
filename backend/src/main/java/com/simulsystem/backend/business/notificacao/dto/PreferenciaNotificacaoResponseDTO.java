package com.simulsystem.backend.business.notificacao.dto;

import java.time.LocalDateTime;

/** Preferência de lembrete devolvida ao usuário. */
public record PreferenciaNotificacaoResponseDTO(

        Long id,

        Long usuarioId,

        Long rotaId,

        String nomeRota,

        Boolean emailAtivo,

        Boolean webPushAtivo,

        Integer antecedenciaHoras,

        LocalDateTime dataCriacao,

        LocalDateTime dataAtualizacao

) {
}
