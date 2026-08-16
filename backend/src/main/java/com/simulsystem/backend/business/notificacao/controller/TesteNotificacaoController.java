package com.simulsystem.backend.business.notificacao.controller;

import com.simulsystem.backend.business.notificacao.service.EnvioNotificacaoService;
import com.simulsystem.backend.business.notificacao.strategy.TipoNotificacao;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notificacoes/teste")
@PreAuthorize("isAuthenticated()")
public class TesteNotificacaoController {

    private final EnvioNotificacaoService envioNotificacaoService;

    public TesteNotificacaoController(
            EnvioNotificacaoService envioNotificacaoService
    ) {
        this.envioNotificacaoService = envioNotificacaoService;
    }

    @PostMapping("/email")
    public ResponseEntity<Void> testarEmail(
            Authentication authentication
    ) {
        String destinatario =
                authentication.getName();

        envioNotificacaoService.enviar(
                TipoNotificacao.EMAIL,
                destinatario,
                "Teste de notificação - SIMUL",
                """
                Este é um e-mail de teste do SIMUL.

                Se você recebeu esta mensagem, o fluxo de envio por SMTP está funcionando corretamente.
                """
        );

        return ResponseEntity.noContent().build();
    }
}