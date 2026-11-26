package com.simulsystem.backend.business.institucional.dto;

/** Integrante da equipe; fotoId é null quando ainda não há foto. */
public record IntegranteResponseDTO(
        Long id,
        String nome,
        String funcao,
        String descricao,
        Long fotoId,
        String link,
        Integer ordem
) {
}
