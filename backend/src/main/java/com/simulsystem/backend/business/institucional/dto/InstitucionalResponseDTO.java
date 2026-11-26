package com.simulsystem.backend.business.institucional.dto;

import java.util.List;

/** Tudo o que a página "Quem somos" mostra. */
public record InstitucionalResponseDTO(
        String sobreProjeto,
        String instituicaoNome,
        String instituicaoTexto,
        String curso,
        List<FotoInstituicaoResponseDTO> fotos,
        List<IntegranteResponseDTO> integrantes
) {
}
