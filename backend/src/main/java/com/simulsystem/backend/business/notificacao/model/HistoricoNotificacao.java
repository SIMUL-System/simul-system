package com.simulsystem.backend.business.notificacao.model;

import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "historico_notificacoes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_historico_notificacao_ocorrencia_canal",
                        columnNames = {
                                "usuario_id",
                                "rota_id",
                                "data_hora_coleta",
                                "canal"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class HistoricoNotificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rota_id", nullable = false)
    private Rota rota;

    @Column(name = "data_hora_coleta", nullable = false)
    private LocalDateTime dataHoraColeta;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal", nullable = false, length = 30)
    private CanalNotificacao canal;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private StatusNotificacao status;

    @Column(name = "numero_tentativas", nullable = false)
    private Integer numeroTentativas;

    @Column(name = "proxima_tentativa")
    private LocalDateTime proximaTentativa;

    @Column(name = "data_envio")
    private LocalDateTime dataEnvio;

    @Column(name = "mensagem_erro", length = 500)
    private String mensagemErro;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    @PrePersist
    public void prePersist() {
        LocalDateTime agora = LocalDateTime.now();

        dataCriacao = agora;
        dataAtualizacao = agora;

        if (status == null) {
            status = StatusNotificacao.PENDENTE;
        }

        if (numeroTentativas == null) {
            numeroTentativas = 0;
        }
    }

    @PreUpdate
    public void preUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }
}