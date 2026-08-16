package com.simulsystem.backend.business.notificacao.service;

import java.time.LocalDateTime;

public interface CalculoNotificacaoService {

    LocalDateTime calcularHorarioEnvio(
            LocalDateTime proximaColeta,
            Integer antecedenciaHoras
    );
}