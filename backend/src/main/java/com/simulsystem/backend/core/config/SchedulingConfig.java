package com.simulsystem.backend.core.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.Clock;
import java.time.ZoneId;

/** Liga o agendamento e fornece o Clock no fuso do SIMUL (America/Sao_Paulo). */
@Configuration
@EnableScheduling
public class SchedulingConfig {

    /** Relógio usado pelo agendador e pelos tokens. */
    @Bean
    public Clock applicationClock(@Value("${simul.time-zone}") String timeZone) {
        return Clock.system(ZoneId.of(timeZone));
    }
}
