package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.cidade.model.Cidade;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.Turno;
import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.model.TipoColeta;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * Texto do lembrete de coleta. Fica num só lugar para que o envio normal
 * e o reenvio (retry) mandem exatamente a mesma mensagem.
 *
 * <p>Não afirma o que a fonte não diz: fala em "coleta seletiva" ou "coleta
 * convencional" conforme o tipo da rota e, quando a prefeitura informa só o
 * turno, cita o turno com a faixa aproximada da cidade (se houver), sem
 * apresentar um horário exato.
 */
@Component
public class MensagemLembrete {

    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    private final CronogramaService cronogramaService;

    /** Sem acesso aos cronogramas: toda coleta é tratada como de horário conhecido. */
    public MensagemLembrete() {
        this(null);
    }

    @Autowired
    public MensagemLembrete(CronogramaService cronogramaService) {
        this.cronogramaService = cronogramaService;
    }

    /** Assunto do e-mail e título da notificação do navegador. */
    public String assunto() {
        return "SIMUL - Lembrete de coleta";
    }

    /** Corpo do lembrete para uma rota de coleta seletiva com horário conhecido. */
    public String texto(String nomeUsuario, String nomeRota, LocalDateTime dataHoraColeta) {
        return montar(nomeUsuario, nomeRota, TipoColeta.SELETIVA, dataHoraColeta, null);
    }

    /** Corpo do lembrete conforme o tipo da rota e a coleta (horário ou só turno). */
    public String texto(String nomeUsuario, Rota rota, LocalDateTime dataHoraColeta) {
        Cronograma coleta = buscarColeta(rota, dataHoraColeta).orElse(null);

        return montar(nomeUsuario, rota.getNome(), rota.getTipoColeta(), dataHoraColeta, coleta);
    }

    private Optional<Cronograma> buscarColeta(Rota rota, LocalDateTime dataHoraColeta) {
        if (cronogramaService == null || rota.getId() == null) {
            return Optional.empty();
        }

        return cronogramaService.buscarCronogramaDaColeta(rota.getId(), dataHoraColeta);
    }

    private String montar(
            String nomeUsuario, String nomeRota, TipoColeta tipo, LocalDateTime dataHoraColeta, Cronograma coleta) {
        String quando;

        if (coleta == null || coleta.possuiHorario()) {
            quando = dataHoraColeta.format(DATA_HORA);
        } else if (coleta.getTurno() == Turno.NAO_INFORMADO) {
            quando = dataHoraColeta.format(DATA) + " (a prefeitura não informa o turno nem o horário)";
        } else {
            quando = dataHoraColeta.format(DATA) + ", no turno " + coleta.getTurno().getDescricao()
                    + faixaDoTurno(coleta);
        }

        return "Olá, " + nomeUsuario + "! A " + nomeDoTipo(tipo) + " da rota " + nomeRota
                + " está prevista para " + quando + ".";
    }

    /** "coleta seletiva", "coleta convencional" ou só "coleta" (tipo não informado). */
    private static String nomeDoTipo(TipoColeta tipo) {
        if (tipo == TipoColeta.CONVENCIONAL) {
            return "coleta convencional";
        }

        return tipo == TipoColeta.NAO_INFORMADO ? "coleta" : "coleta seletiva";
    }

    /** " (aprox. das 19:00 às 04:00; o horário exato varia por rua)" ou o aviso de horário não informado. */
    private static String faixaDoTurno(Cronograma coleta) {
        Cidade cidade = coleta.getRota() == null ? null : coleta.getRota().getCidade();
        LocalTime inicio = cidade == null ? null : cidade.inicioDoTurno(coleta.getTurno());
        LocalTime fim = cidade == null ? null : cidade.fimDoTurno(coleta.getTurno());

        if (inicio == null || fim == null) {
            return " (a prefeitura não informa o horário exato)";
        }

        return " (aprox. das " + inicio.format(HORA) + " às " + fim.format(HORA)
                + "; o horário exato varia por rua)";
    }
}
