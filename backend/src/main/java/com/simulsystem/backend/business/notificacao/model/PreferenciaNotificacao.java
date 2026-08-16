package com.simulsystem.backend.business.notificacao.model;

import com.simulsystem.backend.business.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "preferencias_notificacao")
@Getter
@Setter
@NoArgsConstructor
public class PreferenciaNotificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "usuario_id",
            nullable = false,
            unique = true
    )
    private Usuario usuario;

    @Column(name = "email_ativo", nullable = false)
    private Boolean emailAtivo;

    @Column(name = "antecedencia_horas", nullable = false)
    private Integer antecedenciaHoras;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    @PrePersist
    public void prePersist() {
        LocalDateTime agora = LocalDateTime.now();

        dataCriacao = agora;
        dataAtualizacao = agora;

        if (emailAtivo == null) {
            emailAtivo = true;
        }

        if (antecedenciaHoras == null) {
            antecedenciaHoras = 2;
        }
    }

    @PreUpdate
    public void preUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }
}