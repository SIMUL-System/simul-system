package com.simulsystem.backend.core.exception;

/** Contorno que não é um Polygon/MultiPolygon GeoJSON válido (vira 400). */
public class GeometriaGeoJsonInvalidaException extends RuntimeException {

    public GeometriaGeoJsonInvalidaException(String message) {
        super(message);
    }
}
