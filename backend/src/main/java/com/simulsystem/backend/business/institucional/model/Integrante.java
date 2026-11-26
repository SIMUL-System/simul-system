package com.simulsystem.backend.business.institucional.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Pessoa da equipe, com função, descrição e foto (opcional). */
@Entity
@Table(name = "integrantes")
@Getter
@Setter
@NoArgsConstructor
public class Integrante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, length = 120)
    private String funcao;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "foto_id")
    private Long fotoId;

    @Column(length = 255)
    private String link;

    @Column(nullable = false)
    private Integer ordem;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    /** Preenche as datas antes de inserir. */
    @PrePersist
    private void prePersist() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = dataCriacao;
    }

    /** Atualiza a data de alteração. */
    @PreUpdate
    private void preUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }
}
