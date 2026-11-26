package com.simulsystem.backend.business.institucional.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Textos da página "Quem somos". Existe uma única linha (id = 1). */
@Entity
@Table(name = "conteudo_institucional")
@Getter
@Setter
@NoArgsConstructor
public class ConteudoInstitucional {

    public static final Long ID_UNICO = 1L;

    @Id
    private Long id;

    @Column(name = "sobre_projeto", nullable = false, columnDefinition = "TEXT")
    private String sobreProjeto;

    @Column(name = "instituicao_nome", nullable = false, length = 150)
    private String instituicaoNome;

    @Column(name = "instituicao_texto", nullable = false, columnDefinition = "TEXT")
    private String instituicaoTexto;

    @Column(nullable = false, length = 150)
    private String curso;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    /** Atualiza a data de alteração. */
    @PrePersist
    @PreUpdate
    private void atualizarData() {
        dataAtualizacao = LocalDateTime.now();
    }
}
