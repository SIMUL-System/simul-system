package com.simulsystem.backend.business.cidade.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.simulsystem.backend.business.cronograma.model.Turno;

import java.time.LocalDateTime;
import java.time.LocalTime;

/** Município atendido. Cada rota e cada bairro pertencem a uma única cidade. */
@Entity
@Table(name = "cidades")
@Getter
@Setter
@NoArgsConstructor
public class Cidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, length = 2)
    private String uf;

    /** De onde vieram os dados de coleta (documento, data, órgão). */
    @Column(columnDefinition = "TEXT")
    private String fonte;

    /**
     * Faixa média de cada turno na cidade, informada pela operadora. É
     * mostrada como aproximada e usada como início do turno no lembrete;
     * o horário exato de cada rota continua não informado.
     */
    @Column(name = "diurno_inicio")
    private LocalTime diurnoInicio;

    @Column(name = "diurno_fim")
    private LocalTime diurnoFim;

    @Column(name = "noturno_inicio")
    private LocalTime noturnoInicio;

    @Column(name = "noturno_fim")
    private LocalTime noturnoFim;

    /** Quem informou a faixa dos turnos (operadora ou prefeitura). */
    @Column(name = "fonte_turnos", length = 255)
    private String fonteTurnos;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    /** Início do turno na cidade (null quando a cidade não tem a faixa ou o turno não é informado). */
    public LocalTime inicioDoTurno(Turno turno) {
        if (turno == Turno.DIURNO) {
            return diurnoInicio;
        }

        return turno == Turno.NOTURNO ? noturnoInicio : null;
    }

    /** Fim do turno na cidade (pode ser no dia seguinte, como 19h às 4h). */
    public LocalTime fimDoTurno(Turno turno) {
        if (turno == Turno.DIURNO) {
            return diurnoFim;
        }

        return turno == Turno.NOTURNO ? noturnoFim : null;
    }

    /** Preenche as datas antes de inserir. */
    @PrePersist
    private void prePersist() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = dataCriacao;
    }

    /** Atualiza a data de alteração. */
    @PreUpdate
    private void preUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }
}
