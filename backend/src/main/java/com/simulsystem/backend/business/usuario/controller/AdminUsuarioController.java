package com.simulsystem.backend.business.usuario.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoint mínimo protegido por ADMIN, usado nos testes de segurança. */
@RestController
@RequestMapping("/api/admin/usuarios")
public class AdminUsuarioController {

    /** GET /verificar-acesso: 204 para ADMIN, 403 para os demais. */
    @GetMapping("/verificar-acesso")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> verificarAcesso() {
        return ResponseEntity.noContent().build();
    }
}
