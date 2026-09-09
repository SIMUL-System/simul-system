package com.simulsystem.backend.business.usuario.controller;

import com.simulsystem.backend.business.usuario.dto.RecuperacaoSenhaResponseDTO;
import com.simulsystem.backend.business.usuario.dto.RedefinicaoSenhaRequestDTO;
import com.simulsystem.backend.business.usuario.dto.ReenvioVerificacaoEmailRequestDTO;
import com.simulsystem.backend.business.usuario.dto.SolicitacaoRecuperacaoSenhaRequestDTO;
import com.simulsystem.backend.business.usuario.dto.UsuarioRequestDTO;
import com.simulsystem.backend.business.usuario.dto.UsuarioResponseDTO;
import com.simulsystem.backend.business.usuario.dto.VerificacaoEmailRequestDTO;
import com.simulsystem.backend.business.usuario.dto.VerificacaoEmailResponseDTO;
import com.simulsystem.backend.business.usuario.service.RecuperacaoSenhaService;
import com.simulsystem.backend.business.usuario.service.UsuarioService;
import com.simulsystem.backend.business.usuario.service.VerificacaoEmailService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final VerificacaoEmailService verificacaoEmailService;
    private final RecuperacaoSenhaService recuperacaoSenhaService;

    public UsuarioController(
            UsuarioService usuarioService,
            VerificacaoEmailService verificacaoEmailService,
            RecuperacaoSenhaService recuperacaoSenhaService
    ) {
        this.usuarioService =
                usuarioService;

        this.verificacaoEmailService =
                verificacaoEmailService;

        this.recuperacaoSenhaService =
                recuperacaoSenhaService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> cadastrar(
            @Valid @RequestBody UsuarioRequestDTO requestDTO
    ) {
        UsuarioResponseDTO usuario =
                usuarioService.cadastrar(
                        requestDTO
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(usuario);
    }

    @PostMapping("/verificar-email")
    public ResponseEntity<VerificacaoEmailResponseDTO> verificarEmail(
            @Valid @RequestBody VerificacaoEmailRequestDTO requestDTO
    ) {
        VerificacaoEmailResponseDTO resposta =
                verificacaoEmailService.verificarEmail(
                        requestDTO.token()
                );

        if (resposta.verificado()) {
            return ResponseEntity.ok(
                    resposta
            );
        }

        return ResponseEntity
                .badRequest()
                .body(resposta);
    }

    @PostMapping("/reenviar-verificacao")
    public ResponseEntity<Map<String, String>> reenviarVerificacao(
            @Valid @RequestBody ReenvioVerificacaoEmailRequestDTO requestDTO
    ) {
        verificacaoEmailService.reenviarVerificacao(
                requestDTO.email()
        );

        return ResponseEntity.ok(
                Map.of(
                        "mensagem",
                        "Se existir uma conta associada a este e-mail e ela ainda precisar de confirmação, enviaremos uma nova mensagem."
                )
        );
    }

    @PostMapping("/recuperar-senha")
    public ResponseEntity<Map<String, String>> solicitarRecuperacaoSenha(
            @Valid @RequestBody SolicitacaoRecuperacaoSenhaRequestDTO requestDTO
    ) {
        recuperacaoSenhaService.solicitarRecuperacao(
                requestDTO.email()
        );

        return ResponseEntity.ok(
                Map.of(
                        "mensagem",
                        "Se existir uma conta associada a este e-mail, enviaremos as instruções para redefinir a senha."
                )
        );
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<RecuperacaoSenhaResponseDTO> redefinirSenha(
            @Valid @RequestBody RedefinicaoSenhaRequestDTO requestDTO
    ) {
        RecuperacaoSenhaResponseDTO resposta =
                recuperacaoSenhaService.redefinirSenha(
                        requestDTO
                );

        if (resposta.sucesso()) {
            return ResponseEntity.ok(
                    resposta
            );
        }

        return ResponseEntity
                .badRequest()
                .body(resposta);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioResponseDTO> buscarUsuarioAutenticado(
            Authentication authentication
    ) {
        UsuarioResponseDTO usuario =
                usuarioService.buscarUsuarioAutenticado(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                usuario
        );
    }
}