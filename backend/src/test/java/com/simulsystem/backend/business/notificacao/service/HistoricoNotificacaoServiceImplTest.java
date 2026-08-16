package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;
import com.simulsystem.backend.business.notificacao.model.StatusNotificacao;
import com.simulsystem.backend.business.notificacao.repository.HistoricoNotificacaoRepository;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.usuario.model.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HistoricoNotificacaoServiceImplTest {

    @Mock
    private HistoricoNotificacaoRepository repository;

    private HistoricoNotificacaoServiceImpl service;

    private Usuario usuario;
    private Rota rota;
    private LocalDateTime dataHoraColeta;
    private LocalDateTime referencia;

    @BeforeEach
    void setUp() {
        service = new HistoricoNotificacaoServiceImpl(repository);

        usuario = new Usuario();
        usuario.setId(3L);

        rota = new Rota();
        rota.setId(1L);

        dataHoraColeta =
                LocalDateTime.of(2026, 8, 17, 19, 0);

        referencia =
                LocalDateTime.of(2026, 8, 17, 16, 0);
    }

    @Test
    void deveReservarEnvioQuandoAindaNaoExistirHistorico() {
        when(repository
                .existsByUsuarioIdAndRotaIdAndDataHoraColetaAndCanal(
                        3L,
                        1L,
                        dataHoraColeta,
                        CanalNotificacao.EMAIL
                ))
                .thenReturn(false);

        when(repository.saveAndFlush(any(HistoricoNotificacao.class)))
                .thenAnswer(invocation -> {
                    HistoricoNotificacao historico =
                            invocation.getArgument(0);

                    historico.setId(1L);
                    return historico;
                });

        Optional<HistoricoNotificacao> resultado =
                service.reservarEnvio(
                        usuario,
                        rota,
                        dataHoraColeta,
                        CanalNotificacao.EMAIL
                );

        assertTrue(resultado.isPresent());

        HistoricoNotificacao historico =
                resultado.orElseThrow();

        assertEquals(
                StatusNotificacao.PENDENTE,
                historico.getStatus()
        );

        assertEquals(
                CanalNotificacao.EMAIL,
                historico.getCanal()
        );

        assertEquals(
                0,
                historico.getNumeroTentativas()
        );
    }

    @Test
    void naoDeveReservarQuandoHistoricoJaExistir() {
        when(repository
                .existsByUsuarioIdAndRotaIdAndDataHoraColetaAndCanal(
                        3L,
                        1L,
                        dataHoraColeta,
                        CanalNotificacao.EMAIL
                ))
                .thenReturn(true);

        Optional<HistoricoNotificacao> resultado =
                service.reservarEnvio(
                        usuario,
                        rota,
                        dataHoraColeta,
                        CanalNotificacao.EMAIL
                );

        assertTrue(resultado.isEmpty());

        verify(repository, never())
                .saveAndFlush(any(HistoricoNotificacao.class));
    }

    @Test
    void naoDeveReservarQuandoBancoDetectarConcorrencia() {
        when(repository
                .existsByUsuarioIdAndRotaIdAndDataHoraColetaAndCanal(
                        3L,
                        1L,
                        dataHoraColeta,
                        CanalNotificacao.EMAIL
                ))
                .thenReturn(false);

        when(repository.saveAndFlush(any(HistoricoNotificacao.class)))
                .thenThrow(
                        new DataIntegrityViolationException(
                                "Registro duplicado"
                        )
                );

        Optional<HistoricoNotificacao> resultado =
                service.reservarEnvio(
                        usuario,
                        rota,
                        dataHoraColeta,
                        CanalNotificacao.EMAIL
                );

        assertTrue(resultado.isEmpty());
    }

    @Test
    void deveMarcarComoEnviadoEIncrementarTentativa() {
        HistoricoNotificacao historico =
                criarHistoricoPendente();

        historico.setNumeroTentativas(0);

        when(repository.findById(1L))
                .thenReturn(Optional.of(historico));

        service.marcarComoEnviado(
                1L,
                referencia
        );

        assertEquals(
                StatusNotificacao.ENVIADO,
                historico.getStatus()
        );

        assertEquals(
                1,
                historico.getNumeroTentativas()
        );

        assertEquals(
                referencia,
                historico.getDataEnvio()
        );

        assertNull(historico.getProximaTentativa());
        assertNull(historico.getMensagemErro());

        verify(repository).save(historico);
    }

    @Test
    void deveAgendarRetryCincoMinutosAposPrimeiraFalha() {
        HistoricoNotificacao historico =
                criarHistoricoPendente();

        historico.setNumeroTentativas(0);

        when(repository.findById(1L))
                .thenReturn(Optional.of(historico));

        service.marcarComoFalha(
                1L,
                "Erro SMTP",
                referencia
        );

        assertEquals(
                StatusNotificacao.FALHA,
                historico.getStatus()
        );

        assertEquals(
                1,
                historico.getNumeroTentativas()
        );

        assertEquals(
                referencia.plusMinutes(5),
                historico.getProximaTentativa()
        );

        assertEquals(
                "Erro SMTP",
                historico.getMensagemErro()
        );

        assertNull(historico.getDataEnvio());

        verify(repository).save(historico);
    }

    @Test
    void deveEncerrarRetriesQuandoTerceiraTentativaFalhar() {
        HistoricoNotificacao historico =
                criarHistoricoPendente();

        historico.setNumeroTentativas(2);

        when(repository.findById(1L))
                .thenReturn(Optional.of(historico));

        service.marcarComoFalha(
                1L,
                "SMTP indisponível",
                referencia
        );

        assertEquals(
                StatusNotificacao.FALHA,
                historico.getStatus()
        );

        assertEquals(
                3,
                historico.getNumeroTentativas()
        );

        assertNull(
                historico.getProximaTentativa()
        );

        verify(repository).save(historico);
    }

    @Test
    void deveBuscarFalhasElegiveisParaRetry() {
        HistoricoNotificacao historico =
                criarHistoricoPendente();

        historico.setStatus(StatusNotificacao.FALHA);
        historico.setNumeroTentativas(1);
        historico.setProximaTentativa(referencia);

        when(repository.buscarFalhasElegiveisParaRetry(
                StatusNotificacao.FALHA,
                referencia,
                3
        )).thenReturn(List.of(historico));

        List<HistoricoNotificacao> resultado =
                service.buscarFalhasElegiveisParaRetry(
                        referencia
                );

        assertEquals(1, resultado.size());

        assertSame(
                historico,
                resultado.getFirst()
        );
    }

    @Test
    void deveRejeitarReferenciaNulaAoBuscarRetries() {
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.buscarFalhasElegiveisParaRetry(
                                null
                        )
        );

        verifyNoInteractions(repository);
    }

    private HistoricoNotificacao criarHistoricoPendente() {
        HistoricoNotificacao historico =
                new HistoricoNotificacao();

        historico.setId(1L);
        historico.setUsuario(usuario);
        historico.setRota(rota);
        historico.setDataHoraColeta(dataHoraColeta);
        historico.setCanal(CanalNotificacao.EMAIL);
        historico.setStatus(StatusNotificacao.PENDENTE);
        historico.setNumeroTentativas(0);

        return historico;
    }
}