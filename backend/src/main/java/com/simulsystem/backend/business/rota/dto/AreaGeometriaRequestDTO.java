package com.simulsystem.backend.business.rota.dto;

import jakarta.validation.constraints.NotBlank;

/** Corpo com o contorno da área em GeoJSON (Polygon ou MultiPolygon). */
public record AreaGeometriaRequestDTO(

        @NotBlank(message = "A geometria GeoJSON é obrigatória.")
        String geometriaGeoJson

) {
}
