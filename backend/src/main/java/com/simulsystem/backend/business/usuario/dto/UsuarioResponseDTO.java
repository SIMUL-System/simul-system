package com.simulsystem.backend.business.usuario.dto;

import com.simulsystem.backend.business.usuario.model.PerfilUsuario;

import java.time.LocalDateTime;

/** Dados públicos do usuário (nunca inclui a senha). */
public record UsuarioResponseDTO(
        Long id,
        String nome,
        String email,
        PerfilUsuario perfil,
        Boolean ativo,
        Boolean emailVerificado,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao
) {
}
