package com.simulsystem.backend.business.notificacao.controller;

import com.simulsystem.backend.business.notificacao.dto.PushSubscriptionRequestDTO;
import com.simulsystem.backend.business.notificacao.dto.PushSubscriptionResponseDTO;
import com.simulsystem.backend.business.notificacao.service.PushSubscriptionService;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.service.UsuarioService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Inscrição dos navegadores do usuário logado no Web Push. */
@RestController
@RequestMapping("/api/notificacoes/push/subscriptions")
@PreAuthorize("hasAnyRole('USUARIO', 'ADMIN')")
public class PushSubscriptionController {

    private final PushSubscriptionService pushSubscriptionService;
    private final UsuarioService usuarioService;

    public PushSubscriptionController(PushSubscriptionService pushSubscriptionService, UsuarioService usuarioService) {
        this.pushSubscriptionService = pushSubscriptionService;
        this.usuarioService = usuarioService;
    }

    /** POST: inscreve este navegador. */
    @PostMapping
    public ResponseEntity<PushSubscriptionResponseDTO> salvar(
            @Valid @RequestBody PushSubscriptionRequestDTO requestDTO,
            Authentication authentication
    ) {
        Usuario usuario = buscarUsuarioAutenticado(authentication);

        PushSubscriptionResponseDTO response = pushSubscriptionService.salvar(usuario, requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /** GET: navegadores inscritos. */
    @GetMapping
    public ResponseEntity<List<PushSubscriptionResponseDTO>> listar(Authentication authentication) {
        Usuario usuario = buscarUsuarioAutenticado(authentication);

        List<PushSubscriptionResponseDTO> subscriptions = pushSubscriptionService.listarPorUsuario(usuario.getId());

        return ResponseEntity.ok(subscriptions);
    }

    /** DELETE ?endpoint=: cancela a inscrição deste navegador. */
    @DeleteMapping
    public ResponseEntity<Void> remover(@RequestParam String endpoint, Authentication authentication) {
        Usuario usuario = buscarUsuarioAutenticado(authentication);

        pushSubscriptionService.remover(usuario.getId(), endpoint);

        return ResponseEntity.noContent().build();
    }

    private Usuario buscarUsuarioAutenticado(Authentication authentication) {
        return usuarioService.buscarEntidadePorEmail(authentication.getName());
    }
}
