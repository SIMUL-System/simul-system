package com.simulsystem.backend.business.institucional.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Foto da faculdade na página "Quem somos". Guarda só o id da imagem,
 * para listar as fotos sem carregar os bytes de cada uma.
 */
@Entity
@Table(name = "fotos_instituicao")
@Getter
@Setter
@NoArgsConstructor
public class FotoInstituicao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "imagem_id", nullable = false, unique = true)
    private Long imagemId;

    @Column(nullable = false, length = 200)
    private String legenda;

    @Column(nullable = false)
    private Integer ordem;
}
