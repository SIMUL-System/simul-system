package com.simulsystem.backend.business.notificacao.service;

import java.time.LocalDateTime;

public interface CalculoNotificacaoService {

    /**
     * Horário em que o lembrete de uma coleta deve ser enviado:
     * data/hora da coleta menos a antecedência.
     */
    LocalDateTime calcularHorarioEnvio(
            LocalDateTime proximaColeta,
            Integer antecedenciaHoras
    );

    /**
     * Data/hora da coleta cujo lembrete deve ser enviado no minuto de
     * referência: referência (truncada ao minuto) mais a antecedência.
     */
    LocalDateTime calcularHorarioColetaAlvo(
            LocalDateTime referencia,
            Integer antecedenciaHoras
    );
}
