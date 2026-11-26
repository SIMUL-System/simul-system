package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.Turno;
import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.model.TipoColeta;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * Texto do lembrete de coleta. Fica num só lugar para que o envio normal
 * e o reenvio (retry) mandem exatamente a mesma mensagem.
 *
 * <p>Não afirma o que a fonte não diz: só fala em "coleta seletiva" quando a
 * rota é seletiva, e, quando a prefeitura informa só o turno, cita o turno
 * em vez de um horário.
 */
@Component
public class MensagemLembrete {

    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

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
        return montar(nomeUsuario, nomeRota, true, dataHoraColeta, null);
    }

    /** Corpo do lembrete conforme o tipo da rota e a coleta (horário ou só turno). */
    public String texto(String nomeUsuario, Rota rota, LocalDateTime dataHoraColeta) {
        Cronograma coleta = buscarColeta(rota, dataHoraColeta).orElse(null);

        return montar(
                nomeUsuario,
                rota.getNome(),
                rota.getTipoColeta() != TipoColeta.NAO_INFORMADO,
                dataHoraColeta,
                coleta);
    }

    private Optional<Cronograma> buscarColeta(Rota rota, LocalDateTime dataHoraColeta) {
        if (cronogramaService == null || rota.getId() == null) {
            return Optional.empty();
        }

        return cronogramaService.buscarCronogramaDaColeta(rota.getId(), dataHoraColeta);
    }

    private String montar(
            String nomeUsuario, String nomeRota, boolean seletiva, LocalDateTime dataHoraColeta, Cronograma coleta) {
        String quando;

        if (coleta == null || coleta.possuiHorario()) {
            quando = dataHoraColeta.format(DATA_HORA);
        } else if (coleta.getTurno() == Turno.NAO_INFORMADO) {
            quando = dataHoraColeta.format(DATA) + " (a prefeitura não informa o turno nem o horário)";
        } else {
            quando = dataHoraColeta.format(DATA) + ", no turno " + coleta.getTurno().getDescricao()
                    + " (a prefeitura não informa o horário exato)";
        }

        return "Olá, " + nomeUsuario + "! A coleta" + (seletiva ? " seletiva" : "") + " da rota " + nomeRota
                + " está prevista para " + quando + ".";
    }
}
