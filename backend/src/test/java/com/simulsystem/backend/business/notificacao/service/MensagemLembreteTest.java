package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.cidade.model.Cidade;
import com.simulsystem.backend.business.cronograma.model.Cronograma;
import com.simulsystem.backend.business.cronograma.model.Turno;
import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.model.TipoColeta;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class MensagemLembreteTest {

    private static final LocalDateTime QUARTA_18H = LocalDateTime.of(2026, 11, 25, 18, 0);

    private final MensagemLembrete mensagem = new MensagemLembrete();

    @Test
    void deveMontarTextoComNomeRotaEDataDaColeta() {
        String texto = mensagem.texto(
                "Ana", "Senador Canedo - Diurna (seg, qua e sex)", LocalDateTime.of(2026, 11, 25, 6, 0));

        assertEquals(
                "Olá, Ana! A coleta seletiva da rota Senador Canedo - Diurna (seg, qua e sex) "
                        + "está prevista para 25/11/2026 às 06:00.",
                texto);
    }

    @Test
    void deveUsarAssuntoPadrao() {
        assertEquals("SIMUL - Lembrete de coleta", mensagem.assunto());
    }

    @Test
    void deveCitarOTurnoQuandoAPrefeituraNaoInformaOHorario() {
        Rota rota = rota(TipoColeta.SELETIVA);
        MensagemLembrete comCronogramas = new MensagemLembrete(servicoCom(rota, coleta(Turno.NOTURNO, null)));

        assertEquals(
                "Olá, Ana! A coleta seletiva da rota Goiânia - Noturna (qua) está prevista para 25/11/2026, "
                        + "no turno noturno (a prefeitura não informa o horário exato).",
                comCronogramas.texto("Ana", rota, QUARTA_18H));
    }

    @Test
    void naoDeveChamarDeSeletivaQuandoAFonteNaoInformaOTipo() {
        Rota rota = rota(TipoColeta.NAO_INFORMADO);
        MensagemLembrete comCronogramas = new MensagemLembrete(servicoCom(rota, coleta(Turno.NOTURNO, LocalTime.of(18, 0))));

        assertEquals(
                "Olá, Ana! A coleta da rota Goiânia - Noturna (qua) está prevista para 25/11/2026 às 18:00.",
                comCronogramas.texto("Ana", rota, QUARTA_18H));
    }

    @Test
    void deveAvisarQuandoNemOTurnoFoiInformado() {
        Rota rota = rota(TipoColeta.SELETIVA);
        MensagemLembrete comCronogramas = new MensagemLembrete(servicoCom(rota, coleta(Turno.NAO_INFORMADO, null)));

        assertEquals(
                "Olá, Ana! A coleta seletiva da rota Goiânia - Noturna (qua) está prevista para 25/11/2026 "
                        + "(a prefeitura não informa o turno nem o horário).",
                comCronogramas.texto("Ana", rota, QUARTA_18H));
    }

    @Test
    void deveCitarAColetaConvencionalEAFaixaDoTurnoDaCidade() {
        Cidade trindade = new Cidade();
        trindade.setNome("Trindade");
        trindade.setNoturnoInicio(LocalTime.of(18, 0));
        trindade.setNoturnoFim(LocalTime.of(3, 0));

        Rota rota = rota(TipoColeta.CONVENCIONAL);
        rota.setCidade(trindade);
        Cronograma coleta = coleta(Turno.NOTURNO, null);
        coleta.setRota(rota);

        MensagemLembrete comCronogramas = new MensagemLembrete(servicoCom(rota, coleta));

        assertEquals(
                "Olá, Ana! A coleta convencional da rota Goiânia - Noturna (qua) está prevista para 25/11/2026, "
                        + "no turno noturno (aprox. das 18:00 às 03:00; o horário exato varia por rua).",
                comCronogramas.texto("Ana", rota, QUARTA_18H));
    }

    private Rota rota(TipoColeta tipo) {
        Rota rota = new Rota();
        rota.setId(4L);
        rota.setNome("Goiânia - Noturna (qua)");
        rota.setTipoColeta(tipo);
        return rota;
    }

    private Cronograma coleta(Turno turno, LocalTime inicio) {
        Cronograma cronograma = new Cronograma();
        cronograma.setTurno(turno);
        cronograma.setHorarioInicio(inicio);
        cronograma.setHorarioFim(inicio == null ? null : inicio.plusHours(4));
        return cronograma;
    }

    private CronogramaService servicoCom(Rota rota, Cronograma coleta) {
        CronogramaService servico = Mockito.mock(CronogramaService.class);
        when(servico.buscarCronogramaDaColeta(rota.getId(), QUARTA_18H)).thenReturn(Optional.of(coleta));
        return servico;
    }
}
