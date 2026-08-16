package com.simulsystem.backend.business.notificacao.model;

import com.simulsystem.backend.business.rota.model.Rota;
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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "rota_id",
            nullable = false
    )
    private Rota rota;

    @Column(name = "email_ativo", nullable = false)
    private Boolean emailAtivo;

    @Column(name = "web_push_ativo", nullable = false)
    private Boolean webPushAtivo;

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

        if (webPushAtivo == null) {
            webPushAtivo = false;
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