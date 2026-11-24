package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;

import java.time.LocalDateTime;
import java.util.Optional;

public interface DecisaoNotificacaoService {

    /**
     * Retorna a data/hora da coleta cujo lembrete deve ser enviado no
     * minuto de referência, ou vazio se nenhum lembrete vence agora.
     */
    Optional<LocalDateTime> buscarColetaParaLembrete(
            PreferenciaNotificacao preferencia,
            LocalDateTime referencia
    );
}
