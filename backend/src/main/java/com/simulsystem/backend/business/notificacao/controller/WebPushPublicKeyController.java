package com.simulsystem.backend.business.notificacao.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/notificacoes/push")
public class WebPushPublicKeyController {

    private final String publicKey;

    public WebPushPublicKeyController(
            @Value("${simul.webpush.vapid.public-key}")
            String publicKey
    ) {
        this.publicKey = publicKey;
    }

    @GetMapping("/public-key")
    public ResponseEntity<Map<String, String>> obterChavePublica() {
        return ResponseEntity.ok(
                Map.of(
                        "publicKey",
                        publicKey
                )
        );
    }
}