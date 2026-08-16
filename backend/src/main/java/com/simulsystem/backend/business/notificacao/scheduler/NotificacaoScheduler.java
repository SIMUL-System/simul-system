package com.simulsystem.backend.business.notificacao.scheduler;

import com.simulsystem.backend.business.notificacao.service.CicloNotificacaoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
@ConditionalOnProperty(
        prefix = "simul.notificacao.scheduler",
        name = "enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class NotificacaoScheduler {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    NotificacaoScheduler.class
            );

    private final CicloNotificacaoService cicloNotificacaoService;
    private final Clock clock;

    public NotificacaoScheduler(
            CicloNotificacaoService cicloNotificacaoService,
            Clock clock
    ) {
        this.cicloNotificacaoService =
                cicloNotificacaoService;

        this.clock = clock;
    }

    @Scheduled(
            cron = "${simul.notificacao.scheduler.cron}",
            zone = "${simul.time-zone}"
    )
    public void executar() {
        LocalDateTime referencia =
                LocalDateTime.now(clock)
                        .truncatedTo(
                                ChronoUnit.MINUTES
                        );

        LOGGER.debug(
                "Iniciando ciclo de notificações. referencia={}",
                referencia
        );

        cicloNotificacaoService.executar(
                referencia
        );
    }
}