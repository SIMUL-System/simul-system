package com.simulsystem.backend.business.cronograma.model;

import com.simulsystem.backend.business.rota.model.Rota;

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
import java.time.LocalTime;

/**
 * Coleta de uma rota em um dia da semana e turno (só uma ativa por rota, dia e
 * turno). O horário é opcional: quando a fonte informa só o turno, início e
 * fim ficam vazios e nada é inventado.
 */
@Entity
@Table(name = "cronogramas")
@Getter
@Setter
@NoArgsConstructor
public class Cronograma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rota_id", nullable = false)
    private Rota rota;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false, length = 10)
    private DiaSemana diaSemana;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private Turno turno;

    @Column(name = "horario_inicio")
    private LocalTime horarioInicio;

    @Column(name = "horario_fim")
    private LocalTime horarioFim;

    @Column(nullable = false)
    private Boolean ativo;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    /** O horário exato é conhecido? (falso quando a fonte informa só o turno) */
    public boolean possuiHorario() {
        return horarioInicio != null && horarioFim != null;
    }

    /**
     * Momento usado para calcular o lembrete: o início informado ou, sem
     * horário, o começo de referência do turno (não exibido como horário).
     */
    public LocalTime horarioReferencia() {
        if (horarioInicio != null) {
            return horarioInicio;
        }

        return (turno == null ? Turno.NAO_INFORMADO : turno).getInicioReferencia();
    }

    /** Preenche as datas (e os padrões) antes de inserir. */
    @PrePersist
    private void prePersist() {
        LocalDateTime agora = LocalDateTime.now();

        this.dataCriacao = agora;
        this.dataAtualizacao = agora;

        if (this.ativo == null) {
            this.ativo = true;
        }

        if (this.turno == null) {
            this.turno = Turno.doHorario(this.horarioInicio);
        }
    }

    /** Atualiza a data de alteração. */
    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }
}
