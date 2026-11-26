package com.simulsystem.backend.business.institucional.dto;

/** Foto da faculdade: o endereço da imagem é /api/institucional/imagens/{imagemId}. */
public record FotoInstituicaoResponseDTO(Long id, Long imagemId, String legenda, Integer ordem) {
}
