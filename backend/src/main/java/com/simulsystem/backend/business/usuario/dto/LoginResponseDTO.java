package com.simulsystem.backend.business.usuario.dto;

public record LoginResponseDTO(
        String token,
        String tipo
) {
}