package com.simulsystem.backend.core.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CorsConfigTest {

    private final CorsConfig corsConfig =
            new CorsConfig();

    @Test
    void devePermitirOrigensConfiguradasNasRotasDaApi() {
        CorsConfigurationSource source =
                corsConfig.corsConfigurationSource(
                        "http://localhost:5173,https://simul.exemplo.com"
                );

        MockHttpServletRequest request =
                new MockHttpServletRequest();

        request.setRequestURI(
                "/api/rotas/consulta"
        );

        CorsConfiguration configuration =
                source.getCorsConfiguration(request);

        assertNotNull(configuration);

        assertEquals(
                List.of(
                        "http://localhost:5173",
                        "https://simul.exemplo.com"
                ),
                configuration.getAllowedOrigins()
        );

        assertTrue(
                configuration
                        .getAllowedMethods()
                        .contains("GET")
        );

        assertTrue(
                configuration
                        .getAllowedMethods()
                        .contains("POST")
        );

        assertTrue(
                configuration
                        .getAllowedHeaders()
                        .contains("Authorization")
        );

        assertFalse(
                Boolean.TRUE.equals(
                        configuration.getAllowCredentials()
                )
        );
    }

    @Test
    void naoDeveAplicarConfiguracaoCorsForaDaApi() {
        CorsConfigurationSource source =
                corsConfig.corsConfigurationSource(
                        "http://localhost:5173"
                );

        MockHttpServletRequest request =
                new MockHttpServletRequest();

        request.setRequestURI(
                "/qualquer-outra-rota"
        );

        CorsConfiguration configuration =
                source.getCorsConfiguration(request);

        assertNull(configuration);
    }
}