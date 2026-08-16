package com.simulsystem.backend.business.notificacao.dto;

import java.time.LocalDateTime;

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