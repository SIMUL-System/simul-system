package com.simulsystem.backend.business.usuario.controller;

import com.simulsystem.backend.business.usuario.dto.LoginRequestDTO;
import com.simulsystem.backend.business.usuario.dto.LoginResponseDTO;
import com.simulsystem.backend.business.usuario.service.UsuarioService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Login com e-mail e senha; devolve o JWT (/api/auth). */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /** POST /login: devolve o JWT (403 se o e-mail ainda não foi confirmado). */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO requestDTO) {
        LoginResponseDTO response = usuarioService.autenticar(requestDTO);

        return ResponseEntity.ok(response);
    }
}
