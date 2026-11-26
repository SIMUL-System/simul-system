package com.simulsystem.backend.business.rota.model;

import com.simulsystem.backend.business.cidade.model.Cidade;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Bairro de uma cidade ligado a uma rota, com o contorno opcional em GeoJSON. */
@Entity
@Table(name = "areas_atendidas")
@Getter
@Setter
@NoArgsConstructor
public class AreaAtendida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Cidade do bairro; é sempre a mesma da rota (garantido também pelo banco). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cidade_id", nullable = false)
    private Cidade cidade;

    @Column(nullable = false, length = 120)
    private String bairro;

    @Column(name = "geometria_geojson", columnDefinition = "TEXT")
    private String geometriaGeoJson;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rota_id", nullable = false)
    private Rota rota;

    /** Nome da cidade (atalho para telas e mensagens). */
    public String getNomeCidade() {
        return cidade == null ? null : cidade.getNome();
    }
}
