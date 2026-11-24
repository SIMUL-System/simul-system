package com.simulsystem.backend.core.status;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Verificação de saúde, pública e sem banco: responde rápido.
 * Usada no "Health Check Path" da Render e por um serviço de ping
 * externo, que mantém a instância gratuita acordada (e com ela o
 * agendador dos lembretes).
 */
@RestController
@RequestMapping("/api/status")
public class StatusController {

    /** GET /api/status (público): {"status":"ok"}. */
    @GetMapping
    public ResponseEntity<Map<String, String>> status() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
