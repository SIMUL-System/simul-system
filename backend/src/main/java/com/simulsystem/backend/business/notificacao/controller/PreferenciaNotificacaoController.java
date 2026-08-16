package com.simulsystem.backend.business.notificacao.controller;

import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoRequestDTO;
import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoResponseDTO;
import com.simulsystem.backend.business.notificacao.service.PreferenciaNotificacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notificacoes/preferencias")
@PreAuthorize("isAuthenticated()")
public class PreferenciaNotificacaoController {

    private final PreferenciaNotificacaoService service;

    public PreferenciaNotificacaoController(
            PreferenciaNotificacaoService service
    ) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<PreferenciaNotificacaoResponseDTO> cadastrar(
            Authentication authentication,
            @Valid @RequestBody PreferenciaNotificacaoRequestDTO requestDTO
    ) {
        PreferenciaNotificacaoResponseDTO response =
                service.cadastrar(
                        authentication.getName(),
                        requestDTO
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<PreferenciaNotificacaoResponseDTO> buscar(
            Authentication authentication
    ) {
        PreferenciaNotificacaoResponseDTO response =
                service.buscar(
                        authentication.getName()
                );

        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<PreferenciaNotificacaoResponseDTO> atualizar(
            Authentication authentication,
            @Valid @RequestBody PreferenciaNotificacaoRequestDTO requestDTO
    ) {
        PreferenciaNotificacaoResponseDTO response =
                service.atualizar(
                        authentication.getName(),
                        requestDTO
                );

        return ResponseEntity.ok(response);
    }
}