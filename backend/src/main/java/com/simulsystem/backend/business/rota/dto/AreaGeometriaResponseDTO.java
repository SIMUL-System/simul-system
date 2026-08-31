package com.simulsystem.backend.business.rota.dto;

public record AreaGeometriaResponseDTO(
        Long areaId,
        String cidade,
        String bairro,
        String geometriaGeoJson
) {
}