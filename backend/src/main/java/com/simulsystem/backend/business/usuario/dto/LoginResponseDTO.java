package com.simulsystem.backend.business.usuario.dto;

/** Token JWT devolvido no login (tipo Bearer). */
public record LoginResponseDTO(String token, String tipo) {
}
