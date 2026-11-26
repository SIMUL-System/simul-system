package com.simulsystem.backend.business.notificacao.model;

import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.usuario.model.Usuario;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Como o morador quer ser lembrado: bairro, canais e antecedência. */
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
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    /**
     * Bairro escolhido pelo morador. A rota vem do bairro, então se o
     * administrador mover o bairro para outra rota, o lembrete acompanha.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "area_atendida_id", nullable = false)
    private AreaAtendida areaAtendida;

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

    /** Rota atual do bairro escolhido (null se ainda não houver bairro). */
    public Rota getRota() {
        return areaAtendida == null ? null : areaAtendida.getRota();
    }

    /** Preenche as datas (e os padrões) antes de inserir. */
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

    /** Atualiza a data de alteração. */
    @PreUpdate
    public void preUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }
}
