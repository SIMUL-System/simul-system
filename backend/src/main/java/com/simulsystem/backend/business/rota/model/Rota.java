package com.simulsystem.backend.business.rota.model;

import com.simulsystem.backend.business.cidade.model.Cidade;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Agrupa os bairros de UMA cidade que têm a mesma coleta (dias e turnos).
 * Inativa, some da consulta e dos lembretes.
 */
@Entity
@Table(name = "rotas")
@Getter
@Setter
@NoArgsConstructor
public class Rota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    /** Cidade da rota. Não muda depois de criada: os bairros dela são dessa cidade. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cidade_id", nullable = false, updatable = false)
    private Cidade cidade;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_coleta", nullable = false, length = 20)
    private TipoColeta tipoColeta;

    /** Documento de onde vieram os dias e turnos (vazio quando cadastrada à mão). */
    @Column(length = 255)
    private String fonte;

    @Column(length = 255)
    private String descricao;

    @Column(nullable = false)
    private Boolean ativo;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    /** Preenche as datas (e os padrões) antes de inserir. */
    @PrePersist
    private void prePersist() {
        LocalDateTime agora = LocalDateTime.now();

        this.dataCriacao = agora;
        this.dataAtualizacao = agora;

        if (this.ativo == null) {
            this.ativo = true;
        }

        if (this.tipoColeta == null) {
            this.tipoColeta = TipoColeta.SELETIVA;
        }
    }

    /** Atualiza a data de alteração. */
    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }
}
