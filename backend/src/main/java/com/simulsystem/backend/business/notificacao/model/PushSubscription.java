package com.simulsystem.backend.business.notificacao.model;

import com.simulsystem.backend.business.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "push_subscriptions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_push_subscription_endpoint",
                        columnNames = "endpoint"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class PushSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "usuario_id",
            nullable = false
    )
    private Usuario usuario;

    @Column(
            name = "endpoint",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String endpoint;

    @Column(
            name = "p256dh",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String p256dh;

    @Column(
            name = "auth",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String auth;

    @Column(
            name = "data_criacao",
            nullable = false
    )
    private LocalDateTime dataCriacao;

    @Column(
            name = "data_atualizacao",
            nullable = false
    )
    private LocalDateTime dataAtualizacao;

    @PrePersist
    public void prePersist() {
        LocalDateTime agora =
                LocalDateTime.now();

        dataCriacao = agora;
        dataAtualizacao = agora;
    }

    @PreUpdate
    public void preUpdate() {
        dataAtualizacao =
                LocalDateTime.now();
    }
}