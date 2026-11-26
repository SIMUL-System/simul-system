package com.simulsystem.backend.business.institucional.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Foto guardada no banco (JPEG, PNG ou WebP). Nunca é alterada: trocar a foto cria outra. */
@Entity
@Table(name = "imagens")
@Getter
@Setter
@NoArgsConstructor
public class Imagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_conteudo", nullable = false, length = 30)
    private String tipoConteudo;

    @Column(nullable = false)
    private byte[] dados;

    @Column(name = "tamanho_bytes", nullable = false)
    private Integer tamanhoBytes;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    /** Preenche a data antes de inserir. */
    @PrePersist
    private void prePersist() {
        dataCriacao = LocalDateTime.now();
    }
}
