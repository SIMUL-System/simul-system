package com.simulsystem.backend.business.notificacao.service;

import java.time.LocalDateTime;

/** Cálculo de horários do lembrete. */
public interface CalculoNotificacaoService {

    /**
     * Data/hora da coleta cujo lembrete deve sair no minuto de referência:
     * referência (sem segundos) mais a antecedência escolhida pelo morador.
     */
    LocalDateTime calcularHorarioColetaAlvo(LocalDateTime referencia, Integer antecedenciaHoras);
}
