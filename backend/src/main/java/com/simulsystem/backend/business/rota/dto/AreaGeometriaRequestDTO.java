package com.simulsystem.backend.business.rota.dto;

import jakarta.validation.constraints.NotBlank;

public record AreaGeometriaRequestDTO(

        @NotBlank(
                message = "A geometria GeoJSON é obrigatória."
        )
        String geometriaGeoJson

) {
}