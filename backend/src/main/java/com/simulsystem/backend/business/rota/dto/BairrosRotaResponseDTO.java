package com.simulsystem.backend.business.rota.dto;

import java.util.List;

/**
 * Resultado da inclusão de bairros numa rota: quais foram cadastrados,
 * quais vieram de outra rota e quais já estavam nela.
 */
public record BairrosRotaResponseDTO(
        List<String> cadastrados,
        List<String> movidos,
        List<String> jaEstavamNaRota
) {
}
