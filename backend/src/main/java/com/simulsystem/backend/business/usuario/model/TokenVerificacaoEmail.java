package com.simulsystem.backend.business.usuario.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens_verificacao_email")
@Getter
@Setter
@NoArgsConstructor
public class TokenVerificacaoEmail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "usuario_id",
            nullable = false
    )
    private Usuario usuario;

    @Column(
            name = "token_hash",
            nullable = false,
            unique = true,
            length = 64
    )
    private String tokenHash;

    @Column(
            name = "data_expiracao",
            nullable = false
    )
    private LocalDateTime dataExpiracao;

    @Column(
            name = "utilizado",
            nullable = false
    )
    private Boolean utilizado;

    @Column(
            name = "data_utilizacao"
    )
    private LocalDateTime dataUtilizacao;

    @Column(
            name = "data_criacao",
            nullable = false,
            updatable = false
    )
    private LocalDateTime dataCriacao;

    @PrePersist
    private void prePersist() {
        if (this.utilizado == null) {
            this.utilizado = false;
        }

        if (this.dataCriacao == null) {
            this.dataCriacao =
                    LocalDateTime.now();
        }
    }
}