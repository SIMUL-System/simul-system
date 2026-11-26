package com.simulsystem.backend.business.cronograma.model;

import java.time.LocalTime;

/**
 * Turno da coleta, como as prefeituras informam. Muitas fontes dizem só
 * "diurno" ou "noturno", sem horário: nesse caso o cronograma guarda o turno
 * e deixa início e fim vazios.
 *
 * <p>O {@code inicioReferencia} NÃO é mostrado como horário da coleta. Ele só
 * serve para calcular quando mandar o lembrete de um turno sem horário
 * (por exemplo, 3 horas antes do começo do turno da noite).
 */
public enum Turno {

    DIURNO("diurno", LocalTime.of(6, 0)),
    NOTURNO("noturno", LocalTime.of(18, 0)),
    NAO_INFORMADO("turno não informado", LocalTime.of(6, 0));

    private final String descricao;
    private final LocalTime inicioReferencia;

    Turno(String descricao, LocalTime inicioReferencia) {
        this.descricao = descricao;
        this.inicioReferencia = inicioReferencia;
    }

    public String getDescricao() {
        return descricao;
    }

    public LocalTime getInicioReferencia() {
        return inicioReferencia;
    }

    /** Turno de um horário exato: das 18h às 5h59 é noturno. */
    public static Turno doHorario(LocalTime inicio) {
        if (inicio == null) {
            return NAO_INFORMADO;
        }

        return inicio.getHour() >= 18 || inicio.getHour() < 6 ? NOTURNO : DIURNO;
    }
}
