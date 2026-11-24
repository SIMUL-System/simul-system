package com.simulsystem.backend.business.rota.dto;

/** Contorno salvo de uma área. */
public record AreaGeometriaResponseDTO(Long areaId, String cidade, String bairro, String geometriaGeoJson) {
}
