package com.simulsystem.backend.business.notificacao.scheduler;

import com.simulsystem.backend.business.notificacao.service.CicloNotificacaoService;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class NotificacaoSchedulerTest {

    @Test
    void deveExecutarCicloComHorarioAtualTruncadoParaMinuto() {
        CicloNotificacaoService cicloNotificacaoService =
                mock(CicloNotificacaoService.class);

        ZoneId zoneId =
                ZoneId.of(
                        "America/Sao_Paulo"
                );

        Clock clock =
                Clock.fixed(
                        Instant.parse(
                                "2026-08-17T19:00:37Z"
                        ),
                        zoneId
                );

        NotificacaoScheduler scheduler =
                new NotificacaoScheduler(
                        cicloNotificacaoService,
                        clock
                );

        scheduler.executar();

        verify(cicloNotificacaoService)
                .executar(
                        LocalDateTime.of(
                                2026,
                                8,
                                17,
                                16,
                                0
                        )
                );
    }
}