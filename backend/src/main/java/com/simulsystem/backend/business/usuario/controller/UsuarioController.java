package com.simulsystem.backend.business.usuario.controller;

import com.simulsystem.backend.business.usuario.dto.UsuarioRequestDTO;
import com.simulsystem.backend.business.usuario.dto.UsuarioResponseDTO;
import com.simulsystem.backend.business.usuario.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> cadastrar(
            @Valid @RequestBody UsuarioRequestDTO requestDTO
    ) {
        UsuarioResponseDTO usuario = usuarioService.cadastrar(requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(usuario);
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

    return ResponseEntity.ok(usuario);
}
}