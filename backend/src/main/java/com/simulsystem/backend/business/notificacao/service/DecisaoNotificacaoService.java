package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;

import java.time.LocalDateTime;

public interface DecisaoNotificacaoService {

    boolean estaNoHorarioDoLembrete(
            PreferenciaNotificacao preferencia,
            LocalDateTime referencia
    );
}